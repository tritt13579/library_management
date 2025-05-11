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
    <Link href="">
      <div className="flex h-[400px] w-full cursor-pointer flex-col rounded-xl bg-white shadow transition hover:shadow-lg">
        <div className="h-64 w-full overflow-hidden rounded-t-xl">
          <img src={image} alt={title} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-grow flex-col p-4">
          <h3 className="line-clamp-2 text-base font-semibold text-[#0071BC]">
            {title}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-gray-600">{author}</p>
          <p className="mt-auto text-xs italic text-gray-400">{category}</p>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
