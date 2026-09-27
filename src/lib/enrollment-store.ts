import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  students as initialStudents,
  courses as initialCourses,
} from "@/lib/mock-data";
import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];

  // Student management
  enrollStudent: (studentId: string, courseCode: string) => void;
  dropStudent: (studentId: string, courseCode: string) => void;
  removeStudent: (studentId: string) => void;

  // Course management
  addCourse: (
    courseCode: string,
    courseTitle: string,
    instructors: string[],
  ) => void;
  removeCourse: (courseCode: string) => void;
  addInstructor: (courseCode: string, instructorName: string) => void;
  removeInstructor: (courseCode: string, instructorName: string) => void;
};

// Get student ID from localStorage or default
const getStudentId = (): string => {
  if (typeof window === "undefined") return "6706200999";
  return localStorage.getItem("studentId") || "6706200999";
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,

      enrollStudent: (studentId, courseCode) =>
        set((state) => {
          const student = state.students.find((s) => s.studentId === studentId);
          if (!student || student.enrolledCourses.includes(courseCode)) {
            return state;
          }
          return {
            students: state.students.map((s) =>
              s.studentId === studentId
                ? { ...s, enrolledCourses: [...s.enrolledCourses, courseCode] }
                : s,
            ),
          };
        }),

      dropStudent: (studentId, courseCode) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.studentId === studentId
              ? {
                  ...s,
                  enrolledCourses: s.enrolledCourses.filter(
                    (code) => code !== courseCode,
                  ),
                }
              : s,
          ),
        })),

      removeStudent: (studentId) =>
        set((state) => ({
          students: state.students.filter((s) => s.studentId !== studentId),
        })),

      addCourse: (courseCode, courseTitle, instructors) =>
        set((state) => {
          const courseExists = state.courses.some(
            (c) => c.courseCode.toLowerCase() === courseCode.toLowerCase(),
          );
          if (courseExists) return state;

          return {
            courses: [
              ...state.courses,
              {
                courseCode: courseCode.toUpperCase(),
                courseTitle,
                instructors: instructors.filter((i) => i.trim()),
              },
            ],
          };
        }),

      removeCourse: (courseCode) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.courseCode !== courseCode),
          students: state.students.map((s) => ({
            ...s,
            enrolledCourses: s.enrolledCourses.filter(
              (code) => code !== courseCode,
            ),
          })),
        })),

      addInstructor: (courseCode, instructorName) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.courseCode === courseCode
              ? {
                  ...c,
                  instructors: [
                    ...(c.instructors || []),
                    instructorName.trim(),
                  ].filter((i) => i),
                }
              : c,
          ),
        })),

      removeInstructor: (courseCode, instructorName) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.courseCode === courseCode
              ? {
                  ...c,
                  instructors: (c.instructors || []).filter(
                    (i) => i !== instructorName,
                  ),
                }
              : c,
          ),
        })),
    }),
    {
      name: `lab16-2569-${getStudentId()}`,
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  ),
);
