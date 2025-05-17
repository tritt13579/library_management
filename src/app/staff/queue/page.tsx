'use client';
import React, { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/client";
import { Input } from "@/components/ui/input";

interface Author {
  author_name: string;
}

interface Book {
  title: string;
  cover_image?: string;
  iswrittenby: { author: Author }[];
}

interface Reader {
  first_name: string;
  last_name?: string;
}

interface LibraryCard {
  card_number: string;
  reader: Reader;
}

interface Reservation {
  reservation_status: string;
  booktitle: Book;
  library_card: LibraryCard;
}

interface QueueItem {
  id: number;
  position: number;
  reservation: Reservation;
}

interface GroupedQueue {
  title: string;
  author: string;
  cover_image?: string;
  items: QueueItem[];
}

export default function QueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      const supabase = supabaseClient();
      const { data, error } = await supabase
        .from("reservationqueue")
        .select(`
          *,
          reservation:reservation_id(
            *, 
            booktitle(
              title,
              cover_image,
              iswrittenby!inner (
                author:author_id ( author_name )
              )
            ),
            library_card:card_id(
              *,
              reader(*)
            )
          )
        `);

      if (error) {
        console.error("Error fetching books:", error.message);
      } else {
        setQueue(data || []);
      }
    };

    fetchBooks();
  }, []);

  const groupedQueues: GroupedQueue[] = Object.values(
    queue.reduce((acc: { [key: string]: GroupedQueue }, item: QueueItem) => {
      const title = item.reservation?.booktitle?.title ?? "Không rõ";
      const author = item.reservation?.booktitle?.iswrittenby?.[0]?.author?.author_name ?? "Không rõ";
      const cover_image = item.reservation?.booktitle?.cover_image;
      const key = `${title}-${author}`;

      if (!acc[key]) {
        acc[key] = {
          title,
          author,
          cover_image,
          items: [],
        };
      }
      acc[key].items.push(item);
      return acc;
    }, {})
  );

  const filteredQueues = groupedQueues
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        const title = group.title.toLowerCase();
        const cardNumber = item.reservation?.library_card?.card_number?.toLowerCase() || "";
        return (
          title.includes(searchTerm.toLowerCase()) ||
          cardNumber.includes(searchTerm.toLowerCase())
        );
      })
    }))
    .filter(group => group.items.length > 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Hàng đợi đặt sách</h1>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Tìm theo tên sách hoặc mã thẻ"
          className="w-full h-12 md:w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredQueues.length === 0 ? (
        <p className="text-gray-500">Không tìm thấy kết quả.</p>
      ) : (
        filteredQueues.map((group, index) => (
          <div key={index} className="border rounded-md shadow-md p-4">
            <div className="flex items-start space-x-4 mb-4">
              {group.cover_image && (
                <img
                  src={group.cover_image}
                  alt={`Bìa sách ${group.title}`}
                  className="w-20 h-28 object-cover rounded shadow"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-cover.png';
                  }}
                />
              )}
              <div>
                <h2 className="text-xl font-semibold">{group.title}</h2>
                <p className="text-gray-700">Tác giả: {group.author}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700 border rounded-md">
                <thead className="bg-neutral-100 dark:bg-neutral-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">STT</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Người đặt</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Thẻ thư viện</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Vị trí</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
                  {group.items
                    .sort((a, b) => a.position - b.position)
                    .map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm text-gray-700">{idx + 1}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {item.reservation?.library_card?.reader
                            ? `${item.reservation.library_card.reader.last_name ?? ''} ${item.reservation.library_card.reader.first_name ?? ''}`.trim() || 'Không rõ'
                            : 'Không rõ'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {item.reservation?.library_card?.card_number ?? '---'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">{item.position}</td>
                        <td className={`px-4 py-2 text-sm font-semibold ${getStatusColor(item.reservation?.reservation_status)}`}>
                          {item.reservation?.reservation_status}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function getStatusColor(status: string = '') {
  switch (status) {
    case 'Đang chờ':
      return 'text-yellow-600';
    case 'Đã xác nhận':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}
