import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function StartClassButton({ liveClassId }) {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        onClick={() => navigate(`/live-class/${liveClassId}/room`)}
      >
        Start Class
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => navigate(`/live-class/${liveClassId}/room?device=board`)}
      >
        Join as Board Camera
      </Button>
    </div>
  );
}