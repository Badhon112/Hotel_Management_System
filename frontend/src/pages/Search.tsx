import { useQuery } from "react-query";
import { useSearchContex } from "../contexts/SearchContext";
import * as apiClient from "../api-client";
import { useState } from "react";

const Search = () => {
  const search = useSearchContex();
  const [page, setPage] = useState<number>(1);

  const searchParams = {
    destination: search.destination,
    checkIn: search.checkIn.toISOString(),
    checkOut: search.checkOut.toISOString(),
    adultCount: search.adultCount.toString(),
    childCount: search.childCount.toString(),
    page: page.toString(),
  };

  const { data: hotelData } = useQuery(["searchHotels", searchParams], () => {
    apiClient.searchHotels(searchParams);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
        <div className="rounded-lg border border-slate-300 p-5 h-fit">
          <div className="space-y-5">
            <h3 className="text-lg font-semibold border-b border-slate-300 pb-5">Filter by:</h3>
          </div>
          {/* TodoFilters  */}
        </div>
    </div>
  )
};

export default Search;
