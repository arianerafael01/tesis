'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createTeacher(formData: FormData) {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const idNumber = formData.get('idNumber') as string
  const fileNumber = formData.get('fileNumber') as string
  const birthdate = formData.get('birthdate') as string
  const nationality = formData.get('nationality') as string
  const address = formData.get('address') as string
  const neighborhood = formData.get('neighborhood') as string

  try {
    await prisma.teacher.create({
      data: {
        firstName,
        lastName,
        idNumber,
        fileNumber,
        birthdate: new Date(birthdate),
        nationality,
        address,
        neighborhood,
      }
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      if (field === 'idNumber') return { error: 'Ya existe un profesor con ese número de DNI.' }
      if (field === 'fileNumber') return { error: 'Ya existe un profesor con ese número de legajo.' }
      return { error: 'Ya existe un registro con esos datos.' }
    }
    throw error
  }

  revalidatePath('/institutional/teachers')
  return { success: true }
}

export async function updateTeacher(teacherId: string, formData: FormData) {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const idNumber = formData.get('idNumber') as string
  const fileNumber = formData.get('fileNumber') as string
  const birthdate = formData.get('birthdate') as string
  const nationality = formData.get('nationality') as string
  const address = formData.get('address') as string
  const neighborhood = formData.get('neighborhood') as string

  await prisma.teacher.update({
    where: { id: teacherId },
    data: {
      firstName,
      lastName,
      idNumber,
      fileNumber,
      birthdate: new Date(birthdate),
      nationality,
      address,
      neighborhood,
    }
  })

  revalidatePath('/institutional/teachers')
}

export async function deleteTeacher(teacherId: string) {
  await prisma.teacher.delete({
    where: { id: teacherId }
  })
  revalidatePath('/institutional/teachers')
}

export async function assignSubjectToTeacher(teacherId: string, subjectId: string, courseId: string) {
  await prisma.subjectsTeacher.create({
    data: {
      teacherId,
      subjectId,
      courseId,
    }
  })
  revalidatePath('/institutional/teachers')
}

export async function removeSubjectFromTeacher(teacherId: string, subjectId: string, courseId: string) {
  const existing = await prisma.subjectsTeacher.findUnique({
    where: {
      teacherId_subjectId_courseId: {
        teacherId,
        subjectId,
        courseId,
      }
    }
  })

  if (existing) {
    await prisma.subjectsTeacher.delete({
      where: {
        teacherId_subjectId_courseId: {
          teacherId,
          subjectId,
          courseId,
        }
      }
    })
  }
  revalidatePath('/institutional/teachers')
}

export async function createAvailability(teacherId: string, day: 'M' | 'T' | 'W' | 'TH' | 'F', timeRange: string) {
  // Check if availability already exists for this teacher and day
  const existingAvailability = await prisma.availability.findUnique({
    where: {
      teacherId_day: {
        teacherId,
        day,
      }
    }
  })

  if (existingAvailability) {
    // Check if timeRange already exists to prevent duplicates
    if (existingAvailability.timeRanges.includes(timeRange)) {
      return
    }
    // Add time range to existing availability
    await prisma.availability.update({
      where: { id: existingAvailability.id },
      data: {
        timeRanges: {
          push: timeRange
        }
      }
    })
    // Create TeacherAvailability entry for this time slot
    await prisma.teacherAvailability.create({
      data: {
        availabilityId: existingAvailability.id,
        timeRange,
        subjectId: null,
      }
    })
  } else {
    // Create new availability
    const newAvailability = await prisma.availability.create({
      data: {
        teacherId,
        day,
        timeRanges: [timeRange],
      }
    })
    // Create TeacherAvailability entry for this time slot
    await prisma.teacherAvailability.create({
      data: {
        availabilityId: newAvailability.id,
        timeRange,
        subjectId: null,
      }
    })
  }

  revalidatePath('/institutional/teachers')
}

export async function deleteAvailability(availabilityId: string) {
  await prisma.availability.delete({
    where: { id: availabilityId }
  })
  revalidatePath('/institutional/teachers')
}

export async function removeTimeRange(teacherId: string, day: 'M' | 'T' | 'W' | 'TH' | 'F', timeRange: string) {
  const availability = await prisma.availability.findFirst({
    where: {
      teacherId,
      day,
    }
  })

  if (availability) {
    // Delete the TeacherAvailability entry for this time range
    await prisma.teacherAvailability.deleteMany({
      where: {
        availabilityId: availability.id,
        timeRange,
      }
    })

    const updatedTimeRanges = availability.timeRanges.filter(tr => tr !== timeRange)
    
    if (updatedTimeRanges.length === 0) {
      // Si no quedan rangos, eliminar toda la disponibilidad
      await prisma.availability.delete({
        where: { id: availability.id }
      })
    } else {
      // Actualizar con los rangos restantes
      await prisma.availability.update({
        where: { id: availability.id },
        data: {
          timeRanges: updatedTimeRanges
        }
      })
    }
  }
  revalidatePath('/institutional/teachers')
}

export async function assignSubjectToTimeSlot(
  teacherId: string, 
  day: 'M' | 'T' | 'W' | 'TH' | 'F', 
  timeRange: string, 
  subjectId: string | null,
  courseId: string | null
) {
  const availability = await prisma.availability.findFirst({
    where: {
      teacherId,
      day,
    }
  })

  if (!availability) {
    throw new Error('Availability not found')
  }

  if (subjectId === null) {
    // If subjectId is null, delete the TeacherAvailability entry
    await prisma.teacherAvailability.deleteMany({
      where: {
        availabilityId: availability.id,
        timeRange,
      }
    })
  } else {
    if (!courseId) {
      throw new Error('courseId is required when assigning a subject')
    }

    // Check if we're updating an existing slot or creating a new one
    const existingSlot = await prisma.teacherAvailability.findUnique({
      where: {
        availabilityId_timeRange: {
          availabilityId: availability.id,
          timeRange,
        }
      }
    })

    // Only validate module limit if we're assigning a new slot (not updating)
    if (!existingSlot || existingSlot.subjectId !== subjectId) {
      // Get the subject and course-specific module count
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        select: { 
          name: true
        }
      })

      if (!subject) {
        throw new Error('Subject not found')
      }

      // Get the module count for this subject-course combination
      const courseSubject = await prisma.courseSubject.findUnique({
        where: {
          courseId_subjectId: {
            courseId,
            subjectId
          }
        },
        include: {
          course: {
            select: {
              name: true
            }
          }
        }
      })

      if (!courseSubject) {
        throw new Error('Subject is not assigned to this course')
      }

      // Check if there's already another subject from the same course in this time slot
      const conflictingAssignment = await prisma.teacherAvailability.findFirst({
        where: {
          availability: {
            day,
          },
          timeRange,
          subjectId: {
            not: existingSlot?.subjectId || undefined
          }
        },
        include: {
          subject: {
            select: {
              name: true,
              subjectsTeachers: {
                where: {
                  courseId
                },
                select: {
                  course: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          },
          availability: {
            include: {
              teacher: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      })

      if (conflictingAssignment && conflictingAssignment.subject && conflictingAssignment.subject.subjectsTeachers.length > 0) {
        const teacherName = `${conflictingAssignment.availability.teacher.firstName} ${conflictingAssignment.availability.teacher.lastName}`
        const courseName = conflictingAssignment.subject.subjectsTeachers[0].course.name
        throw new Error(`No se puede asignar ${subject.name} en este horario. La materia ${conflictingAssignment.subject.name} del mismo curso (${courseName}) ya está asignada en este horario con el profesor ${teacherName}.`)
      }

      // Count how many slots are already assigned to this specific subject-course combination for this teacher
      const assignedModules = await prisma.teacherAvailability.count({
        where: {
          subjectId,
          courseId,
          availability: {
            teacherId,
          }
        }
      })

      // If we're changing from another subject, don't count the current slot
      const currentCount = existingSlot && existingSlot.subjectId !== subjectId 
        ? assignedModules 
        : assignedModules

      // Check if adding this module would exceed the limit
      if (!existingSlot && currentCount >= courseSubject.modules) {
        throw new Error(`No se pueden asignar más de ${courseSubject.modules} módulos a esta materia para ${courseSubject.course.name}. Ya hay ${currentCount} módulos asignados.`)
      }

      // If updating from a different subject, check the limit
      if (existingSlot && existingSlot.subjectId !== subjectId && currentCount >= courseSubject.modules) {
        throw new Error(`No se pueden asignar más de ${courseSubject.modules} módulos a esta materia para ${courseSubject.course.name}. Ya hay ${currentCount} módulos asignados.`)
      }
    }

    // Update or create TeacherAvailability entry with subjectId and courseId
    await prisma.teacherAvailability.upsert({
      where: {
        availabilityId_timeRange: {
          availabilityId: availability.id,
          timeRange,
        }
      },
      update: {
        subjectId,
        courseId,
      },
      create: {
        availabilityId: availability.id,
        timeRange,
        subjectId,
        courseId,
      }
    })
  }

  revalidatePath('/institutional/teachers')
  revalidatePath('/institutional/reports/weekly-schedule')
}

export async function autoAssignSubjects(teacherId: string) {
  // Get teacher with all subjects and availabilities
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
      subjectsTeachers: {
        include: {
          subject: {
            select: {
              id: true,
              name: true
            }
          },
          course: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      availabilities: {
        include: {
          teacherAvailabilities: true
        },
        orderBy: {
          day: 'asc'
        }
      }
    }
  })

  if (!teacher) {
    throw new Error('Teacher not found')
  }

  // Helper function to get contiguous slots for a day
  const getContiguousSlots = (day: string, count: number, availableSlotsByDay: Map<string, Array<{ timeRange: string; availabilityId: string; index: number }>>) => {
    const daySlots = availableSlotsByDay.get(day) || []
    
    for (let i = 0; i <= daySlots.length - count; i++) {
      const slots = daySlots.slice(i, i + count)
      // Check if slots are contiguous (consecutive indices)
      const isContiguous = slots.every((slot, idx) => idx === 0 || slot.index === slots[idx - 1].index + 1)
      
      if (isContiguous) {
        return slots
      }
    }
    return null
  }

  // Helper function to check if a subject can be assigned to slots (no course conflict)
  const canAssignToSlots = async (slots: Array<{ day: string; timeRange: string }>, courseId: string, currentSubjectId: string) => {
    for (const slot of slots) {
      // Check if there's already another subject from the same course in this time slot (across all teachers)
      const conflict = await prisma.teacherAvailability.findFirst({
        where: {
          availability: { day: slot.day as any },
          timeRange: slot.timeRange,
          subjectId: { not: currentSubjectId },
          courseId: courseId
        }
      })
      if (conflict) return false
    }
    return true
  }

  // Build available slots grouped by day with indices
  const TIME_SLOTS_ORDER = [
    'Módulo 1 (7:30-8:10)', 'Módulo 2 (8:10-8:50)', 'Módulo 3 (9:00-9:40)',
    'Módulo 4 (9:40-10:20)', 'Módulo 5 (10:30-11:10)', 'Módulo 6 (11:10-11:50)',
    'Módulo 7 (12:00-12:40)', 'Módulo 8 (12:40-13:20)', 'Módulo 9 (13:20-14:10)',
    'Módulo 10 (14:10-14:50)', 'Módulo 11 (15:00-15:40)', 'Módulo 12 (15:40-16:20)',
    'Módulo 13 (16:30-17:10)', 'Módulo 14 (17:10-17:50)', 'Módulo 15 (18:00-18:40)',
    'Módulo 16 (18:40-19:20)', 'Módulo 17 (19:30-20:10)'
  ]

  const availableSlotsByDay = new Map<string, Array<{ timeRange: string; availabilityId: string; index: number }>>()
  
  for (const availability of teacher.availabilities) {
    // Only consider slots with a subject assigned as "taken"
    const assignedTimeRanges = availability.teacherAvailabilities
      .filter(ta => ta.subjectId !== null)
      .map(ta => ta.timeRange)
    const unassignedTimeRanges = availability.timeRanges.filter(tr => !assignedTimeRanges.includes(tr))
    
    const slots = unassignedTimeRanges.map(tr => ({
      timeRange: tr,
      availabilityId: availability.id,
      index: TIME_SLOTS_ORDER.indexOf(tr)
    })).sort((a, b) => a.index - b.index)
    
    if (slots.length > 0) {
      availableSlotsByDay.set(availability.day, slots)
    }
  }

  // Build subject-course needs with module counts from CourseSubject
  const subjectCourseNeeds: Array<{ 
    subjectId: string; 
    courseId: string; 
    needed: number; 
    assigned: number; 
    subjectName: string;
    courseName: string;
  }> = []
  
  for (const st of teacher.subjectsTeachers) {
    // Get module count from CourseSubject
    const courseSubject = await prisma.courseSubject.findUnique({
      where: {
        courseId_subjectId: {
          courseId: st.courseId,
          subjectId: st.subjectId
        }
      }
    })

    if (!courseSubject) continue

    // Count already assigned modules for this specific subject-course combination
    const alreadyAssigned = teacher.availabilities.reduce((sum, avail) => {
      return sum + avail.teacherAvailabilities.filter(ta => 
        ta.subjectId === st.subject.id && ta.courseId === st.courseId
      ).length
    }, 0)
    
    subjectCourseNeeds.push({
      subjectId: st.subject.id,
      courseId: st.courseId,
      needed: courseSubject.modules,
      assigned: alreadyAssigned,
      subjectName: st.subject.name,
      courseName: st.course.name
    })
  }

  const subjectsToAssign = subjectCourseNeeds
    .filter(data => data.assigned < data.needed)
    .sort((a, b) => {
      // First priority: total modules needed (descending)
      const moduleDiff = b.needed - a.needed
      if (moduleDiff !== 0) return moduleDiff
      
      // Second priority: remaining modules to assign (descending)
      return (b.needed - b.assigned) - (a.needed - a.assigned)
    })

  console.log('=== AUTO ASSIGN DEBUG ===')
  console.log('Teacher:', teacher.firstName, teacher.lastName)
  console.log('Subject-Course needs:', subjectCourseNeeds)
  console.log('Subjects to assign:', subjectsToAssign)
  console.log('Available slots by day:', Array.from(availableSlotsByDay.entries()))

  let assignedCount = 0
  const errors: string[] = []

  // Helper function to try assigning modules flexibly
  const tryAssignModules = async (
    subjectId: string,
    courseId: string,
    count: number,
    subjectName: string
  ): Promise<number> => {
    let assigned = 0
    const days = Array.from(availableSlotsByDay.keys())
    
    console.log(`  Available days for ${subjectName}:`, days)
    
    // Special handling for 5 modules: try 3+2 split first
    if (count === 5 && assigned === 0) {
      console.log(`  Attempting 3+2 split for 5 modules`)
      for (let i = 0; i < days.length; i++) {
        const slots3 = getContiguousSlots(days[i], 3, availableSlotsByDay)
        if (slots3) {
          for (let j = 0; j < days.length; j++) {
            if (i === j) continue // Different days
            const slots2 = getContiguousSlots(days[j], 2, availableSlotsByDay)
            if (slots2) {
              const allSlots = [
                ...slots3.map(s => ({ day: days[i], timeRange: s.timeRange })),
                ...slots2.map(s => ({ day: days[j], timeRange: s.timeRange }))
              ]
              if (await canAssignToSlots(allSlots, courseId, subjectId)) {
                try {
                  console.log(`  ✓ Found 3+2 split: ${days[i]} (3) + ${days[j]} (2)`)
                  for (const slot of slots3) {
                    await prisma.teacherAvailability.upsert({
                      where: { availabilityId_timeRange: { availabilityId: slot.availabilityId, timeRange: slot.timeRange } },
                      update: { subjectId, courseId },
                      create: { availabilityId: slot.availabilityId, timeRange: slot.timeRange, subjectId, courseId }
                    })
                    assigned++
                    assignedCount++
                  }
                  for (const slot of slots2) {
                    await prisma.teacherAvailability.upsert({
                      where: { availabilityId_timeRange: { availabilityId: slot.availabilityId, timeRange: slot.timeRange } },
                      update: { subjectId, courseId },
                      create: { availabilityId: slot.availabilityId, timeRange: slot.timeRange, subjectId, courseId }
                    })
                    assigned++
                    assignedCount++
                  }
                  const day1List = availableSlotsByDay.get(days[i])!
                  const day2List = availableSlotsByDay.get(days[j])!
                  slots3.forEach(slot => {
                    const idx = day1List.indexOf(slot)
                    if (idx > -1) day1List.splice(idx, 1)
                  })
                  slots2.forEach(slot => {
                    const idx = day2List.indexOf(slot)
                    if (idx > -1) day2List.splice(idx, 1)
                  })
                  return assigned // Successfully assigned all 5 as 3+2
                } catch (error: any) {
                  console.error(`  ✗ Error with 3+2 split:`, error.message)
                  errors.push(`${subjectName}: ${error.message}`)
                }
              }
            }
          }
        }
      }
      console.log(`  ⚠️ Could not find 3+2 split, falling back to flexible assignment`)
    }

    // Special handling for 3 modules: try 3 contiguous first, then 2+1 split
    if (count === 3 && assigned === 0) {
      console.log(`  Attempting 3 contiguous slots for 3 modules`)
      // First try: 3 contiguous slots in one day
      for (const day of days) {
        const slots3 = getContiguousSlots(day, 3, availableSlotsByDay)
        if (slots3 && await canAssignToSlots(slots3.map(s => ({ day, timeRange: s.timeRange })), courseId, subjectId)) {
          try {
            console.log(`  ✓ Found 3 contiguous slots on ${day}`)
            for (const slot of slots3) {
              await prisma.teacherAvailability.upsert({
                where: { availabilityId_timeRange: { availabilityId: slot.availabilityId, timeRange: slot.timeRange } },
                update: { subjectId, courseId },
                create: { availabilityId: slot.availabilityId, timeRange: slot.timeRange, subjectId, courseId }
              })
              assigned++
              assignedCount++
            }
            const dayList = availableSlotsByDay.get(day)!
            slots3.forEach(slot => {
              const idx = dayList.indexOf(slot)
              if (idx > -1) dayList.splice(idx, 1)
            })
            return assigned // Successfully assigned all 3 contiguously
          } catch (error: any) {
            console.error(`  ✗ Error with 3 contiguous:`, error.message)
            errors.push(`${subjectName}: ${error.message}`)
          }
        }
      }
      
      // Second try: 2+1 split across different days
      console.log(`  Attempting 2+1 split for 3 modules`)
      for (let i = 0; i < days.length; i++) {
        const slots2 = getContiguousSlots(days[i], 2, availableSlotsByDay)
        if (slots2) {
          for (let j = 0; j < days.length; j++) {
            if (i === j) continue // Different days
            const slots1 = getContiguousSlots(days[j], 1, availableSlotsByDay)
            if (slots1) {
              const allSlots = [
                ...slots2.map(s => ({ day: days[i], timeRange: s.timeRange })),
                { day: days[j], timeRange: slots1[0].timeRange }
              ]
              if (await canAssignToSlots(allSlots, courseId, subjectId)) {
                try {
                  console.log(`  ✓ Found 2+1 split: ${days[i]} (2) + ${days[j]} (1)`)
                  for (const slot of slots2) {
                    await prisma.teacherAvailability.upsert({
                      where: { availabilityId_timeRange: { availabilityId: slot.availabilityId, timeRange: slot.timeRange } },
                      update: { subjectId, courseId },
                      create: { availabilityId: slot.availabilityId, timeRange: slot.timeRange, subjectId, courseId }
                    })
                    assigned++
                    assignedCount++
                  }
                  await prisma.teacherAvailability.upsert({
                    where: { availabilityId_timeRange: { availabilityId: slots1[0].availabilityId, timeRange: slots1[0].timeRange } },
                    update: { subjectId, courseId },
                    create: { availabilityId: slots1[0].availabilityId, timeRange: slots1[0].timeRange, subjectId, courseId }
                  })
                  assigned++
                  assignedCount++
                  
                  const day1List = availableSlotsByDay.get(days[i])!
                  const day2List = availableSlotsByDay.get(days[j])!
                  slots2.forEach(slot => {
                    const idx = day1List.indexOf(slot)
                    if (idx > -1) day1List.splice(idx, 1)
                  })
                  const idx = day2List.indexOf(slots1[0])
                  if (idx > -1) day2List.splice(idx, 1)
                  
                  return assigned // Successfully assigned all 3 as 2+1
                } catch (error: any) {
                  console.error(`  ✗ Error with 2+1 split:`, error.message)
                  errors.push(`${subjectName}: ${error.message}`)
                }
              }
            }
          }
        }
      }
      console.log(`  ⚠️ Could not find 3 contiguous or 2+1 split, falling back to flexible assignment`)
    }
    
    // Try to assign modules in any possible combination
    while (assigned < count && days.length > 0) {
      let foundSlot = false
      
      // Try contiguous slots first (preferred)
      for (const day of days) {
        const needed = count - assigned
        const daySlots = availableSlotsByDay.get(day)
        console.log(`  Checking day ${day}: ${daySlots?.length || 0} slots available`)
        
        // Try to get as many contiguous slots as possible
        for (let size = Math.min(needed, 3); size >= 1; size--) {
          const slots = getContiguousSlots(day, size, availableSlotsByDay)
          if (slots) {
            console.log(`  Found ${size} contiguous slots on ${day}:`, slots.map(s => s.timeRange))
            const canAssign = await canAssignToSlots(slots.map(s => ({ day, timeRange: s.timeRange })), courseId, subjectId)
            console.log(`  Can assign? ${canAssign}`)
            
            if (canAssign) {
              try {
                for (const slot of slots) {
                  // Use upsert to handle existing records
                  await prisma.teacherAvailability.upsert({
                    where: {
                      availabilityId_timeRange: {
                        availabilityId: slot.availabilityId,
                        timeRange: slot.timeRange
                      }
                    },
                    update: {
                      subjectId,
                      courseId
                    },
                    create: {
                      availabilityId: slot.availabilityId,
                      timeRange: slot.timeRange,
                      subjectId,
                      courseId
                    }
                  })
                  assigned++
                  assignedCount++
                }
                const daySlotsList = availableSlotsByDay.get(day)!
                slots.forEach(slot => {
                  const idx = daySlotsList.indexOf(slot)
                  if (idx > -1) daySlotsList.splice(idx, 1)
                })
                console.log(`  ✓ Assigned ${size} slots successfully`)
                foundSlot = true
                break
              } catch (error: any) {
                console.error(`  ✗ Error upserting TeacherAvailability:`, error.message)
                errors.push(`${subjectName}: ${error.message}`)
              }
            } else {
              console.log(`  ✗ Conflict detected for these slots`)
            }
          }
        }
        if (foundSlot) break
      }
      
      // If no contiguous slots found, break to avoid infinite loop
      if (!foundSlot) {
        console.log(`  ⚠️ No more available slots found for ${subjectName}`)
        break
      }
    }
    
    return assigned
  }

  // Assign subjects following distribution rules
  for (const data of subjectsToAssign) {
    const remaining = data.needed - data.assigned
    if (remaining === 0) continue

    const { subjectId, courseId } = data

    console.log(`\nTrying to assign: ${data.subjectName} (${data.courseName}) - ${remaining} modules needed`)

    const assignedForSubject = await tryAssignModules(subjectId, courseId, remaining, data.subjectName)
    
    if (assignedForSubject < remaining) {
      console.log(`⚠️ Only assigned ${assignedForSubject}/${remaining} modules for ${data.subjectName} (${data.courseName})`)
    } else {
      console.log(`✅ Successfully assigned all ${assignedForSubject} modules for ${data.subjectName} (${data.courseName})`)
    }
  }

  revalidatePath('/institutional/teachers')
  revalidatePath('/institutional/reports/weekly-schedule')

  return {
    success: true,
    assignedCount,
    errors,
    message: `Se asignaron ${assignedCount} módulos automáticamente.${errors.length > 0 ? ` Errores: ${errors.length}` : ''}`
  }
} 