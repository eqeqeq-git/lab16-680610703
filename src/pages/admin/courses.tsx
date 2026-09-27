import { useState, useMemo } from "react";
import { Check, PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEnrollmentStore } from "@/lib/enrollment-store";

export default function AdminCoursesPage() {
  const { courses, addCourse, removeCourse, removeInstructor } =
    useEnrollmentStore();

  const [formCourseCode, setFormCourseCode] = useState("");
  const [formCourseTitle, setFormCourseTitle] = useState("");
  const [formInstructors, setFormInstructors] = useState<string[]>([]);
  const [formInstructorInput, setFormInstructorInput] = useState("");
  const [instructorDropdownOpen, setInstructorDropdownOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  // Get all unique instructors from all courses for suggestions
  const allInstructors = useMemo(() => {
    const instructorSet = new Set<string>();
    courses.forEach((c) => {
      (c.instructors || []).forEach((i) => instructorSet.add(i));
    });
    return Array.from(instructorSet).sort();
  }, [courses]);

  // Check if course code already exists (case-insensitive)
  const courseCodeExists = courses.some(
    (c) => c.courseCode.toLowerCase() === formCourseCode.toLowerCase(),
  );

  const handleAddCourse = () => {
    const trimmedCourseCode = formCourseCode.trim();
    if (!trimmedCourseCode || !formCourseTitle || courseCodeExists) return;
    addCourse(trimmedCourseCode, formCourseTitle, formInstructors);
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setCourseDialogOpen(false);
    setFormCourseCode("");
    setFormCourseTitle("");
    setFormInstructors([]);
    setFormInstructorInput("");
    setInstructorDropdownOpen(false);
  };

  const normalizedInstructorInput = formInstructorInput.trim();

  const filteredInstructorOptions = allInstructors.filter((instructor) =>
    instructor.toLowerCase().includes(normalizedInstructorInput.toLowerCase()),
  );

  const customInstructorName = normalizedInstructorInput
    ? normalizedInstructorInput
    : "";

  const showAddCustomInstructor =
    customInstructorName.length > 0 &&
    !allInstructors.some(
      (instructor) =>
        instructor.toLowerCase() === customInstructorName.toLowerCase(),
    ) &&
    !formInstructors.includes(customInstructorName);

  const handleAddInstructor = (name?: string) => {
    const instructorName = (name ?? formInstructorInput).trim();
    if (!instructorName) {
      setFormInstructorInput("");
      return;
    }

    if (formInstructors.includes(instructorName)) {
      setFormInstructorInput("");
      return;
    }

    setFormInstructors([...formInstructors, instructorName]);
    setFormInstructorInput("");
    setInstructorDropdownOpen(false);
  };

  const handleRemoveInstructor = (instructorName: string) => {
    setFormInstructors(formInstructors.filter((i) => i !== instructorName));
  };

  const handleDeleteCourse = (courseCode: string) => {
    setCourseToDelete(courseCode);
    setDeleteAlertOpen(true);
  };

  const confirmDeleteCourse = () => {
    if (courseToDelete) {
      removeCourse(courseToDelete);
      setDeleteAlertOpen(false);
      setCourseToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="text-sm text-muted-foreground">
            5 วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก
            ตอนลงทะเบียนให้นักศึกษาที่หน้า "จัดการการลงทะเบียน" ทันที
          </p>
        </div>

        <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
          <DialogTrigger render={<Button />}>
            <PlusCircle className="h-4 w-4" />
            เพิ่มวิชา
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-2xl font-semibold text-white">
                เพิ่มวิชาใหม่
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-300">
                วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="formCourseCode">รหัสวิชา</Label>
                <Input
                  id="formCourseCode"
                  placeholder="เช่น CPE303"
                  value={formCourseCode}
                  onChange={(e) => setFormCourseCode(e.currentTarget.value)}
                  aria-invalid={courseCodeExists ? "true" : "false"}
                  className={
                    courseCodeExists
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {courseCodeExists && (
                  <p className="text-xs text-red-400">
                    มีรหัสวิชา {formCourseCode.trim().toUpperCase() || "CS101"}{" "}
                    นี้แล้ว
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="formCourseTitle">ชื่อวิชา</Label>
                <Input
                  id="formCourseTitle"
                  placeholder="เช่น Mobile Application Development"
                  value={formCourseTitle}
                  onChange={(e) => setFormCourseTitle(e.currentTarget.value)}
                />
              </div>

              <div className="relative grid gap-1.5">
                <Label>ผู้สอน</Label>

                <div className="flex min-h-[52px] flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-[#24262a] p-2">
                  {formInstructors.map((instructor) => (
                    <span
                      key={instructor}
                      className="inline-flex items-center gap-1 rounded-md border border-[#3d5a7c] bg-[#163a63] px-2 py-1 text-xs text-white"
                    >
                      {instructor}
                      <button
                        type="button"
                        className="ml-1 text-white/80 hover:text-white"
                        aria-label={`Remove ${instructor}`}
                        onClick={() => handleRemoveInstructor(instructor)}
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <input
                    value={formInstructorInput}
                    placeholder="เลือกหรือพิมพ์ชื่อผู้สอน (ได้หลายคน)"
                    onFocus={() => setInstructorDropdownOpen(true)}
                    onClick={() => setInstructorDropdownOpen(true)}
                    onBlur={() => {
                      setTimeout(() => {
                        setInstructorDropdownOpen(false);
                        setFormInstructorInput("");
                      }, 120);
                    }}
                    onChange={(e) =>
                      setFormInstructorInput(e.currentTarget.value)
                    }
                    className="h-8 min-w-[120px] flex-1 rounded-md border-0 bg-transparent px-1 text-sm text-zinc-200 placeholder:text-zinc-400 focus-visible:outline-none"
                  />
                </div>

                {instructorDropdownOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 max-h-52 overflow-y-auto rounded-lg border border-white/10 bg-[#1f2125] p-1 shadow-xl">
                    {showAddCustomInstructor && (
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          handleAddInstructor(customInstructorName);
                        }}
                        className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-white/5"
                      >
                        <span>+ เพิ่มผู้สอน "{customInstructorName}"</span>
                      </button>
                    )}

                    {filteredInstructorOptions.map((instructor) => {
                      const isSelected = formInstructors.includes(instructor);

                      return (
                        <button
                          key={instructor}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormInstructors((prev) =>
                              isSelected
                                ? prev.filter((item) => item !== instructor)
                                : [...prev, instructor],
                            );
                            setFormInstructorInput("");
                          }}
                          className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-white/5"
                        >
                          <span>{instructor}</span>
                          {isSelected && (
                            <Check className="h-4 w-4 text-emerald-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={
                  !formCourseCode.trim() || !formCourseTitle || courseCodeExists
                }
                onClick={handleAddCourse}
              >
                <PlusCircle className="h-4 w-4" />
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead className="w-12">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลวิชา
                </TableCell>
              </TableRow>
            )}
            {courses.map((course) => (
              <TableRow key={course.courseCode}>
                <TableCell className="font-medium">
                  {course.courseCode}
                </TableCell>
                <TableCell>{course.courseTitle}</TableCell>
                <TableCell>
                  {(course.instructors || []).length === 0 ? (
                    <span className="text-muted-foreground text-sm">
                      ยังไม่มีผู้สอน
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {course.instructors!.map((instructor) => (
                        <Badge
                          key={instructor}
                          variant="secondary"
                          className="border border-blue-400/30 bg-blue-500/15 px-2 py-1 text-xs text-blue-300"
                        >
                          {instructor}
                          <button
                            className="ml-1 text-blue-200 hover:opacity-70"
                            onClick={() =>
                              removeInstructor(course.courseCode, instructor)
                            }
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleDeleteCourse(course.courseCode)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบวิชา?</AlertDialogTitle>
            <AlertDialogDescription>
              ลบ {courseToDelete}
              {" — "}
              {courses.find((c) => c.courseCode === courseToDelete)
                ?.courseTitle || "วิชา"}{" "}
              ออกจากรายวิชาที่เปิดสอน
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCourse}
              className="bg-red-900 text-red-200 hover:bg-red-800"
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
