"use client";
import { useBox } from "@/store/boxStore";
import { Trash, Edit, Boxes } from "lucide-react";
import { useEffect, useState } from "react";
import EditBoxSheet from "./sheet/EditBoxSheet";

const ListeCrates = () => {
  const fetchAllBoxes = useBox((state) => state.fetchAllBoxes);
  const deleteBox = useBox((state) => state.deleteBox);
  const boxState = useBox((state) => state.boxState);
  const [boxId, setBoxId] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchAllBoxes();
  }, [fetchAllBoxes]);

  return (
    <div className="overflow-x-auto">
      <EditBoxSheet id={boxId} open={open} setOpen={setOpen} />
      {boxState.lodingBox && <p className="text-gray-600 mb-4">Chargement...</p>}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              #ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Designation
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              En stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vide
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sortes
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {boxState?.boxes?.map((box) => {
            return (
              <tr
                key={box.id}
                className="text-sm text-gray-500 border-b hover:text-black ease-in delay-75 transition-all"
              >
                <td className="px-6 py-4 whitespace-nowrap">#{box?.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{box.designation}</td>
                <td className="px-6 py-4 whitespace-nowrap">{box.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{box.inStock || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">{box.empty || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">{box.sent || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {box.sent === 0 && (
                    <button className="mr-2" onClick={() => deleteBox(box.id)}>
                      <Trash className="w-4 h-4 cursor-pointer" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setBoxId(box.id);
                      setOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 cursor-pointer" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ListeCrates;