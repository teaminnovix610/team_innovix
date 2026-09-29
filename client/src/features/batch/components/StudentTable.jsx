import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";

export default function StudentTable({ students }) {
  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground">
                No students yet.
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student._id}>
                <TableCell className="whitespace-nowrap">
                  {student.userId?.firstName} {student.userId?.lastName}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {student.phone}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}