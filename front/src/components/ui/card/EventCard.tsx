import { Event } from "@/types/event";

type EventCordProps = {
  event: Event;
  workCount: number;
  onSelect: (id: string) => void;
};

export const EventCard = ({ event, workCount, onSelect }: EventCordProps) => {
  return (
    <div
      className="mb-10 cursor-pointer rounded-r-lg border-l-4 border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500 hover:bg-blue-50"
      onClick={() => onSelect(event.id)}
    >
      <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600">
        {event.name}
      </h3>
      <div className="mt-2 flex items-center justify-between">
        {event.startDate && (
          <p className="text-sm text-gray-500">開催日: {event.startDate}</p>
        )}
        <p className="text-sm font-semibold text-gray-600">{workCount} 作品</p>
      </div>
    </div>
  );
};
