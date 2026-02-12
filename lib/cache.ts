import { unstable_cache } from 'next/cache';

// Cache configuration
const CACHE_TAGS = {
  TEACHERS: 'teachers',
  STUDENTS: 'students',
  COURSES: 'courses',
  SUBJECTS: 'subjects',
  CLASSROOMS: 'classrooms',
  AVAILABILITIES: 'availabilities',
} as const;

const CACHE_REVALIDATE = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  STATIC: 86400, // 24 hours
} as const;

// Generic cache wrapper
export function createCachedQuery<T>(
  queryFn: () => Promise<T>,
  tags: string[],
  revalidate: number = CACHE_REVALIDATE.MEDIUM
) {
  return unstable_cache(queryFn, tags, {
    revalidate,
    tags,
  });
}

// Specific cache helpers
export const cacheConfig = {
  teachers: {
    tags: [CACHE_TAGS.TEACHERS],
    revalidate: CACHE_REVALIDATE.SHORT,
  },
  students: {
    tags: [CACHE_TAGS.STUDENTS],
    revalidate: CACHE_REVALIDATE.SHORT,
  },
  courses: {
    tags: [CACHE_TAGS.COURSES],
    revalidate: CACHE_REVALIDATE.MEDIUM,
  },
  subjects: {
    tags: [CACHE_TAGS.SUBJECTS],
    revalidate: CACHE_REVALIDATE.LONG,
  },
  classrooms: {
    tags: [CACHE_TAGS.CLASSROOMS],
    revalidate: CACHE_REVALIDATE.STATIC,
  },
  availabilities: {
    tags: [CACHE_TAGS.AVAILABILITIES],
    revalidate: CACHE_REVALIDATE.SHORT,
  },
};

export { CACHE_TAGS, CACHE_REVALIDATE };
