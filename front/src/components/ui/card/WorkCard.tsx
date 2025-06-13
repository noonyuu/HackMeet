import { EventWithWorks } from "@/types/project";

type WorkCardProps = {
  work: EventWithWorks;
};
export const WorkCard = ({ work }: WorkCardProps) => {
  return (
    <div className="group flex min-h-[120px] transform flex-col justify-between rounded-lg border bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
      <a href="#" className="block flex-grow">
        <h3 className="mb-3 text-base font-bold text-gray-800 group-hover:text-blue-600">
          {work.title}
        </h3>
      </a>
      <div className="flex items-center text-sm text-gray-600">
        <div className="mr-2 h-6 w-6 flex-shrink-0 rounded-full bg-gray-300"></div>
        <p className="truncate">{}</p>
      </div>
    </div>
  );
};
