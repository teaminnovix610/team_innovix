import { useState } from "react";
import useStudents, { useDeleteStudent } from "../hooks/useStudents";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function StudentsPage() {
  const { data: students, isLoading, isError } = useStudents();
  const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();

  const [studentToDelete, setStudentToDelete] = useState(null);

  if (isLoading) {
    return <div>Loading students...</div>;
  }

  if (isError) {
    return <div>Unable to load students.</div>;
  }

  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    deleteStudent(studentToDelete._id, {
      onSuccess: () => setStudentToDelete(null),
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Students</h1>

      {!students || students.length === 0 ? (
        <div className="text-muted-foreground text-center py-12">
          No students found.
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Class Level</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell className="whitespace-nowrap">
                    {student.userId?.firstName} {student.userId?.lastName}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{student.userId?.email}</TableCell>
                  <TableCell className="whitespace-nowrap">{student.userId?.phone}</TableCell>
                  <TableCell className="whitespace-nowrap">{student.classLevel}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {student.batchIds?.length > 0
                      ? student.batchIds.map((b) => b.name).join(", ")
                      : "Unassigned"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setStudentToDelete(student)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={!!studentToDelete}
        onOpenChange={(open) => !open && setStudentToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {studentToDelete?.userId?.firstName} {studentToDelete?.userId?.lastName}
              </strong>
              ? This will permanently remove their profile and account. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}