"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ClockIcon,
  Filter,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react";

const ReservationsTab = ({ reservations }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Filter reservations based on search term and filter status
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.reader.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      reservation.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.reader.cardNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      reservation.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Quản lý đặt trước sách</CardTitle>
          <CardDescription>
            Danh sách các yêu cầu đặt trước sách của độc giả
          </CardDescription>
        </div>

        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Đặt trước mới
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên độc giả, tên sách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="đang chờ">Đang chờ</SelectItem>
              <SelectItem value="sẵn sàng">Sẵn sàng</SelectItem>
              <SelectItem value="hết hạn">Hết hạn</SelectItem>
              <SelectItem value="đã huỷ">Đã huỷ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Độc giả</TableHead>
              <TableHead>Mã thẻ</TableHead>
              <TableHead>Tên sách</TableHead>
              <TableHead>Ngày đặt</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thông báo</TableHead>
              <TableHead className="w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell className="font-medium">{reservation.id}</TableCell>
                <TableCell>{reservation.reader.name}</TableCell>
                <TableCell>{reservation.reader.cardNumber}</TableCell>
                <TableCell className="max-w-[250px] truncate">
                  <div className="flex flex-col">
                    <span>{reservation.bookTitle}</span>
                    <span className="text-xs text-muted-foreground">
                      {reservation.author}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{reservation.reservationDate}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      reservation.status === "Đang chờ"
                        ? "default"
                        : reservation.status === "Sẵn sàng"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {reservation.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {reservation.notificationSent ? (
                    <Badge
                      variant="outline"
                      className="border-green-200 bg-green-50 text-green-700"
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Đã gửi
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-yellow-200 bg-yellow-50 text-yellow-700"
                    >
                      <ClockIcon className="mr-1 h-3 w-3" />
                      Chưa gửi
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {reservation.status === "Sẵn sàng" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="default">
                            Cho mượn
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem>Chi tiết</DropdownMenuItem>
                          </DialogTrigger>
                        </Dialog>
                        {!reservation.notificationSent && (
                          <DropdownMenuItem>Gửi thông báo</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          Huỷ đặt trước
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-muted-foreground">
          Hiển thị {filteredReservations.length} trong tổng số{" "}
          {reservations.length} đặt trước
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Trước
          </Button>
          <Button variant="outline" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            Sau
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ReservationsTab;
