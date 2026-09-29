import { useState } from "react";
import useTeachers, { useApproveTeacher, useDeleteTeacher } from "../hooks/useTeachers";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
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

export default function TeachersPage() {
  const { data: teachers, isLoading, isError } = useTeachers();
  const { mutate: approve, isPending: isApproving } = useApproveTeacher();
  const { mutate: deleteTeacher, isPending: isDeleting } = useDeleteTeacher();

  const [teacherToDelete, setTeacherToDelete] = useState(null);

  if (isLoading) {
    return <div>Loading teachers...</div>;
  }

  if (isError) {
    return <div>Unable to load teachers.</div>;
  }

  const handleConfirmDelete = () => {
    if (!teacherToDelete) return;
    deleteTeacher(teacherToDelete._id, {
      onSuccess: () => setTeacherToDelete(null),
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Teachers</h1>

      {(!teachers || teachers.length === 0) ? (
        <div className="text-muted-foreground text-center py-12">
          No teachers found.
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher._id}>
                  <TableCell className="whitespace-nowrap">
                    {teacher.userId?.firstName} {teacher.userId?.lastName}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{teacher.userId?.email}</TableCell>
                  <TableCell className="whitespace-nowrap">{teacher.userId?.phone}</TableCell>
                  <TableCell className="whitespace-nowrap">{teacher.qualification || "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">{teacher.experience} yrs</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={teacher.isApproved ? "default" : "secondary"}>
                      {teacher.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap space-x-2">
                    {!teacher.isApproved && (
                      <Button
                        size="sm"
                        disabled={isApproving}
                        onClick={() => approve(teacher._id)}
                      >
                        Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setTeacherToDelete(teacher)}
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
        open={!!teacherToDelete}
        onOpenChange={(open) => !open && setTeacherToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete teacher</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {teacherToDelete?.userId?.firstName} {teacherToDelete?.userId?.lastName}
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