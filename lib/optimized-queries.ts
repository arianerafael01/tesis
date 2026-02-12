import { prisma } from './prisma';
import { createCachedQuery, cacheConfig } from './cache';

// Optimized query for teachers with all relations
export const getTeachersWithRelations = createCachedQuery(
  async () => {
    return await prisma.teacher.findMany({
      include: {
        subjectsTeachers: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                coursesSubjects: {
                  select: {
                    courseId: true,
                    modules: true
                  }
                }
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
            teacherAvailabilities: {
              include: {
                subject: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },
  cacheConfig.teachers.tags,
  cacheConfig.teachers.revalidate
);

// Optimized query for subjects with courses
export const getSubjectsWithCourses = createCachedQuery(
  async () => {
    return await prisma.subject.findMany({
      include: {
        coursesSubjects: {
          include: {
            course: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  },
  cacheConfig.subjects.tags,
  cacheConfig.subjects.revalidate
);

// Optimized query for courses with relations
export const getCoursesWithRelations = createCachedQuery(
  async () => {
    return await prisma.course.findMany({
      include: {
        classroom: true,
        coursesSubjects: {
          include: {
            subject: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },
  cacheConfig.courses.tags,
  cacheConfig.courses.revalidate
);

// Optimized query for classrooms
export const getClassrooms = createCachedQuery(
  async () => {
    return await prisma.classroom.findMany({
      select: {
        id: true,
        name: true,
        classRoomType: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  },
  cacheConfig.classrooms.tags,
  cacheConfig.classrooms.revalidate
);

// Batch query for course subjects (prevents N+1)
export async function getCourseSubjectsBatch(pairs: Array<{ courseId: string; subjectId: string }>) {
  if (pairs.length === 0) return [];
  
  const results = await prisma.courseSubject.findMany({
    where: {
      OR: pairs.map(pair => ({
        courseId: pair.courseId,
        subjectId: pair.subjectId
      }))
    },
    include: {
      course: {
        select: {
          name: true
        }
      }
    }
  });
  
  // Create a map for O(1) lookups
  const resultMap = new Map(
    results.map(r => [`${r.courseId}-${r.subjectId}`, r])
  );
  
  return pairs.map(pair => 
    resultMap.get(`${pair.courseId}-${pair.subjectId}`) || null
  );
}

// Optimized availability check with single query
export async function getTeacherAvailabilityStatus(teacherId: string) {
  const [assignments, availabilities] = await Promise.all([
    prisma.subjectsTeacher.findMany({
      where: { teacherId },
      include: {
        course: {
          include: {
            coursesSubjects: {
              select: {
                subjectId: true,
                modules: true
              }
            }
          }
        }
      }
    }),
    prisma.availability.findMany({
      where: { teacherId },
      select: { timeRanges: true }
    })
  ]);

  let totalModulesNeeded = 0;
  for (const assignment of assignments) {
    const courseSubject = assignment.course.coursesSubjects.find(
      cs => cs.subjectId === assignment.subjectId
    );
    if (courseSubject) {
      totalModulesNeeded += courseSubject.modules;
    }
  }

  const currentTotalSlots = availabilities.reduce(
    (sum, avail) => sum + avail.timeRanges.length,
    0
  );

  return {
    totalModulesNeeded,
    currentTotalSlots,
    hasEnough: currentTotalSlots >= totalModulesNeeded,
    missing: Math.max(0, totalModulesNeeded - currentTotalSlots)
  };
}
