import { useState } from "react";
import { Check, PlusCircle } from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}) {
  return (
    <Select value={value ?? ""} onValueChange={(next) => onChange(next)}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, enrollStudent, dropStudent } =
    useEnrollmentStore();

  const [formCourse, setFormCourse] = useState<string | null>(
    "CS201 — Data Structures",
  );
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState<string | null>("ทุกวิชา");
  const [filterStudent, setFilterStudent] = useState<string | null>("ทุกคน");
  const [studentSearchOpen, setStudentSearchOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [studentToDrop, setStudentToDrop] = useState<{
    studentId: string;
    courseCode: string;
  } | null>(null);

  const courseOptions: Option[] = [
    {
      value: "CS201 — Data Structures",
      label: "CS201 — Data Structures",
    },
    ...courses.map((c) => ({
      value: c.courseCode,
      label: `${c.courseCode} — ${c.courseTitle}`,
    })),
  ];

  const studentOptions: Option[] = students.map((student) => ({
    value: student.studentId,
    label: `${student.studentId} — ${student.firstName} ${student.lastName}`,
  }));

  const selectableStudentOptions = students
    .filter((student) => !student.enrolledCourses.includes(formCourse || ""))
    .map((student) => ({
      id: student.studentId,
      label: `${student.studentId} — ${student.firstName} ${student.lastName}`,
    }));

  const filteredStudentOptions = selectableStudentOptions.filter((student) => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return true;
    return student.label.toLowerCase().includes(query);
  });

  const addStudent = (student: { id: string; label: string }) => {
    setSelectedStudentIds((prev) =>
      prev.includes(student.id)
        ? prev.filter((id) => id !== student.id)
        : [...prev, student.id],
    );
  };

  const removeStudent = (id: string) => {
    setSelectedStudentIds((prev) => prev.filter((s) => s !== id));
  };

  const handleEnroll = () => {
    if (!formCourse || selectedStudentIds.length === 0) return;

    const courseCode = formCourse.split(" — ")[0] || formCourse;

    selectedStudentIds.forEach((studentId) => {
      enrollStudent(studentId, courseCode);
    });

    setSelectedStudentIds([]);
    setStudentSearch("");
    setStudentSearchOpen(false);
    setEnrollDialogOpen(false);
  };

  const handleDropCourse = (studentId: string, courseCode: string) => {
    setStudentToDrop({ studentId, courseCode });
    setDeleteAlertOpen(true);
  };

  const confirmDropCourse = () => {
    if (studentToDrop) {
      dropStudent(studentToDrop.studentId, studentToDrop.courseCode);
      setDeleteAlertOpen(false);
      setStudentToDrop(null);
    }
  };

  // Get all enrollments and group by course
  const courseEnrollments = courses.map((course) => {
    const enrolledStudents = students.filter((s) =>
      s.enrolledCourses.includes(course.courseCode),
    );
    return {
      ...course,
      enrolledStudents,
    };
  });

  const filteredCourseEnrollments = courseEnrollments.filter((course) => {
    if (mode === "course") {
      if (
        !filterCourse ||
        filterCourse === "ทุกวิชา" ||
        filterCourse === "all"
      ) {
        return true;
      }

      return (
        course.courseCode === filterCourse ||
        `${course.courseCode} — ${course.courseTitle}` === filterCourse ||
        course.courseTitle === filterCourse
      );
    }

    if (mode === "student") {
      if (
        !filterStudent ||
        filterStudent === "ทุกคน" ||
        filterStudent === "all"
      ) {
        return true;
      }

      const selectedStudent = students.find(
        (student) => student.studentId === filterStudent,
      );

      if (!selectedStudent) {
        return true;
      }

      return selectedStudent.enrolledCourses.includes(course.courseCode);
    }

    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>
      <div className="flex items-center justify-start">
        <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
          <DialogTrigger render={<Button />}>
            <PlusCircle className="h-4 w-4" />
            ลงทะเบียนให้นักศึกษา
          </DialogTrigger>
          <DialogContent className="w-[420px] max-w-[420px] rounded-xl border border-white/10 bg-[#1b1b1d] p-0 text-white shadow-2xl">
            <div className="px-4 pt-4">
              <DialogHeader className="px-0">
                <DialogTitle className="text-base font-semibold text-white">
                  ลงทะเบียนให้นักศึกษา
                </DialogTitle>
                <DialogDescription className="text-sm text-zinc-300">
                  เลือกวิชาก่อน แล้วเลือกนักศึกษาที่ยังไม่ได้ลงทะเบียนวิชานั้น
                  (เลือกได้มากกว่า 1 คน)
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="grid gap-4 px-4 pb-4 pt-2">
              <div className="grid gap-1.5">
                <Label
                  htmlFor="formCourse"
                  className="text-sm font-medium text-zinc-200"
                >
                  วิชา
                </Label>
                <OptionSelect
                  id="formCourse"
                  options={courseOptions}
                  value={formCourse}
                  placeholder="เลือกวิชา"
                  onChange={(v) => {
                    setFormCourse(v);
                  }}
                />
              </div>

              <div className="relative grid gap-1.5">
                <Label
                  htmlFor="student-search"
                  className="text-sm font-medium text-zinc-200"
                >
                  นักศึกษา
                </Label>

                <div className="flex min-h-[52px] flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-[#24262a] p-2">
                  {selectedStudentIds.map((id) => {
                    const student = students.find((s) => s.studentId === id);
                    const name = student
                      ? `${student.firstName} ${student.lastName}`
                      : id;

                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-md border border-[#3d5a7c] bg-[#163a63] px-2 py-1 text-xs text-white"
                      >
                        {name}
                        <button
                          type="button"
                          className="ml-1 text-white/80 hover:text-white"
                          aria-label={`Remove ${name}`}
                          onClick={() => removeStudent(id)}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}

                  <Input
                    id="student-search"
                    value={studentSearch}
                    placeholder="ค้นหา/เลือกนักศึกษา"
                    onChange={(e) => {
                      setStudentSearch(e.currentTarget.value);
                      setStudentSearchOpen(true);
                    }}
                    onFocus={() => setStudentSearchOpen(true)}
                    onClick={() => setStudentSearchOpen(true)}
                    onBlur={() =>
                      setTimeout(() => setStudentSearchOpen(false), 120)
                    }
                    className="h-8 min-w-[180px] flex-1 rounded-md border-0 bg-transparent px-1 text-sm text-zinc-200 placeholder:text-zinc-400 focus-visible:ring-0"
                  />
                </div>

                {studentSearchOpen && filteredStudentOptions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 max-h-52 overflow-y-auto rounded-lg border border-white/10 bg-[#1f2125] p-1 shadow-xl">
                    {filteredStudentOptions.map((student) => {
                      const isSelected = selectedStudentIds.includes(
                        student.id,
                      );

                      return (
                        <button
                          key={student.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => addStudent(student)}
                          className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-white/5"
                        >
                          <span>{student.label}</span>
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

            <DialogFooter className="mt-0 border-t border-white/10 bg-[#1d1d20] p-4">
              <Button
                className="border border-white/10 bg-[#2b2b2f] text-white hover:bg-[#36363a] disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={selectedStudentIds.length === 0}
                onClick={handleEnroll}
              >
                <PlusCircle className="h-4 w-4" />
                ลงทะเบียน ({selectedStudentIds.length} คน)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "course" | "student")}
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "ทุกวิชา", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "ทุกคน", label: "ทุกคน" }, ...studentOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourseEnrollments.filter(
              (c) => c.enrolledStudents.length > 0,
            ).length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            )}
            {filteredCourseEnrollments
              .filter((c) => c.enrolledStudents.length > 0)
              .map((course) => (
                <TableRow key={course.courseCode}>
                  <TableCell className="font-medium">
                    {course.courseCode}
                  </TableCell>
                  <TableCell>{course.courseTitle}</TableCell>
                  <TableCell>{course.enrolledStudents.length}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {course.enrolledStudents.map((student) => (
                        <Badge
                          key={student.studentId}
                          variant="secondary"
                          className="border border-blue-400/30 bg-blue-500/15 px-2 py-1 text-xs text-blue-300"
                        >
                          {student.firstName} {student.lastName}
                          <button
                            className="ml-1 text-blue-200 hover:opacity-70"
                            onClick={() =>
                              handleDropCourse(
                                student.studentId,
                                course.courseCode,
                              )
                            }
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการยกเลิกการลงทะเบียน</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือว่าต้องการยกเลิกการลงทะเบียนของนักศึกษาคนนี้?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDropCourse}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
            >
              ยกเลิก
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
