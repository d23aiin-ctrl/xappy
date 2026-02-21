"use client";

import { useEffect, useState } from "react";
import {
  Home,
  Plus,
  Search,
  Filter,
  MoreVertical,
  MapPin,
  Bed,
  Bath,
  Square,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import type { Property, PropertyStatus } from "@/types";

const statusColors: Record<PropertyStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
  available: { bg: "bg-green-100", text: "text-green-700", label: "Available" },
  let_agreed: { bg: "bg-blue-100", text: "text-blue-700", label: "Let Agreed" },
  let: { bg: "bg-purple-100", text: "text-purple-700", label: "Let" },
  unavailable: { bg: "bg-amber-100", text: "text-amber-700", label: "Unavailable" },
  archived: { bg: "bg-gray-100", text: "text-gray-500", label: "Archived" },
};

const mockProperties: Partial<Property>[] = [
  {
    id: "1",
    reference: "PROP-001",
    property_type: "flat",
    status: "let",
    address: { line1: "Flat 5, Riverside Court", city: "London", postcode: "SW1A 1AA", country: "UK" },
    bedrooms: 2,
    bathrooms: 1,
    floor_area_sqft: 750,
    rent_pcm: 1850,
    photos: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
  },
  {
    id: "2",
    reference: "PROP-002",
    property_type: "house",
    status: "available",
    address: { line1: "23 Victoria Gardens", city: "Manchester", postcode: "M1 2AB", country: "UK" },
    bedrooms: 3,
    bathrooms: 2,
    floor_area_sqft: 1200,
    rent_pcm: 1450,
    photos: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400"],
  },
  {
    id: "3",
    reference: "PROP-003",
    property_type: "flat",
    status: "let_agreed",
    address: { line1: "15 Park Lane", city: "Birmingham", postcode: "B1 3CD", country: "UK" },
    bedrooms: 1,
    bathrooms: 1,
    floor_area_sqft: 550,
    rent_pcm: 950,
    photos: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"],
  },
];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Partial<Property>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    // Simulated API call
    setTimeout(() => {
      setProperties(mockProperties);
      setLoading(false);
    }, 500);
  }, []);

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.address?.line1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address?.postcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your property portfolio ({properties.length} properties)
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
          <Plus className="h-5 w-5 mr-2" />
          Add Property
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by address, postcode, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="let">Let</option>
          <option value="let_agreed">Let Agreed</option>
          <option value="unavailable">Unavailable</option>
          <option value="draft">Draft</option>
        </select>
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 ${viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 ${viewMode === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Properties Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition group"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                {property.photos?.[0] ? (
                  <img
                    src={property.photos[0]}
                    alt={property.address?.line1}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[property.status!]?.bg} ${statusColors[property.status!]?.text}`}>
                    {statusColors[property.status!]?.label}
                  </span>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition">
                  <button className="p-2 bg-white rounded-lg shadow hover:bg-gray-50">
                    <MoreVertical className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-1">{property.reference}</p>
                <h3 className="font-semibold text-gray-900 mb-1">{property.address?.line1}</h3>
                <p className="text-sm text-gray-500 flex items-center mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.address?.city}, {property.address?.postcode}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {property.bedrooms}
                  </span>
                  <span className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.bathrooms}
                  </span>
                  {property.floor_area_sqft && (
                    <span className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      {property.floor_area_sqft} sqft
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="text-lg font-bold text-gray-900">
                    £{property.rent_pcm?.toLocaleString()}<span className="text-sm font-normal text-gray-500">/pcm</span>
                  </p>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden mr-3">
                        {property.photos?.[0] ? (
                          <img src={property.photos[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{property.address?.line1}</p>
                        <p className="text-sm text-gray-500">{property.address?.city}, {property.address?.postcode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[property.status!]?.bg} ${statusColors[property.status!]?.text}`}>
                      {statusColors[property.status!]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center"><Bed className="h-4 w-4 mr-1" />{property.bedrooms}</span>
                      <span className="flex items-center"><Bath className="h-4 w-4 mr-1" />{property.bathrooms}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">£{property.rent_pcm?.toLocaleString()}/pcm</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
