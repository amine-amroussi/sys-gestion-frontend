import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";

const FilterSection = ({ filters, setFilters, onApply }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Filter className="size-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Filters</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search..."
          />
        </div>
      </div>
      <Button onClick={onApply} className="mt-4">
        Apply Filters
      </Button>
    </div>
  );
};

export default FilterSection;