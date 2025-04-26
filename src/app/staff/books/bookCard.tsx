import React from "react";
import Link from "next/link";

interface BookCardProps {
  title: string;
  author: string;
  image: string;
  category: string;
}

const BookCard: React.FC<BookCardProps> = ({ title, author, image, category }) => {
    return (
      <Link href="">
        <div className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition w-full flex flex-col">
          <div className="w-full h-64 overflow-hidden rounded-t-xl">
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-base font-semibold text-[#0071BC] line-clamp-2">{title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{author}</p>
            <p className="text-xs text-gray-400 italic mt-auto">{category}</p>
          </div>
        </div>
      </Link>
    );
  };

export default BookCard;
