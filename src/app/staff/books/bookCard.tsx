import React from "react";
import Link from "next/link";

interface BookCardProps {
  title: string;
  author: string;
  image: string;
  category: string;
}

const BookCard: React.FC<BookCardProps> = ({
  title,
  author,
  image,
  category,
}) => {
  return (
    <Link href="#">
      <div className="flex h-[400px] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all">
        <div className="h-72 w-full overflow-hidden">
          <img
            src={image || "/default-cover.jpg"}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-between flex-1 p-4">
          <h3 className="text-base font-semibold text-blue-700 line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{author}</p>
          <p className="text-xs text-gray-400 italic mt-auto">{category}</p>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
