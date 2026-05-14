import { useEffect, useState } from "react";
import { api } from "@/lib/api/auth-client";

import {
  Check,
  PersonStanding,
  MapPin,
  BadgeCheck,
  CloudUpload,
  Send,
  Search,
  LocateFixed,
  X,
} from "lucide-react";

import {
  MapContainer as LeafletMapContainer,
  TileLayer as LeafletTileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";

const MapContainer = LeafletMapContainer as any;
const TileLayer = LeafletTileLayer as any;

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* FIX LEAFLET DEFAULT ICON */
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type PositionType = {
  lat: number;
  lng: number;
};

function LocationMarker({
  position,
  setPosition,
}: {
  position: PositionType;
  setPosition: React.Dispatch<
    React.SetStateAction<PositionType>
  >;
}) {
  useMapEvents({
    click(e: any) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });
  return (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  );
}

export default function AuthorizationForm() {
  const [mapView, setMapView] = useState(false);

  const [openMap, setOpenMap] = useState(false);

  const [profile, setProfile] = useState({
    approvalStatus: "PENDING",
    companyAddressLine1: "",
    email: "",
    fullName: "",
    gstin: "",
    panNumber: "",
    phoneNumber: "",
    gender: "",
    latitude: 34.052235,
    longitude: -118.243683,
    userType: "",
  });

  const [address, setAddress] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [personalEmail, setPersonalEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [panCardFile, setPanCardFile] = useState<File | null>(null);
  const [gstinDocumentFile, setGstinDocumentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [acceptDeclaration, setAcceptDeclaration] = useState(false);
  const [mapQuery, setMapQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);

  const [position, setPosition] = useState({
    lat: 34.052235,
    lng: -118.243683,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/profile/me");
        const payload = response.data?.data || response.data || {};
        console.log("Fetched profile:", payload);

        setProfile((prev) => ({
          ...prev,
          approvalStatus: payload.approvalStatus ?? prev.approvalStatus,
          companyAddressLine1:
            payload.companyAddressLine1 ?? prev.companyAddressLine1,
          email: payload.email ?? prev.email,
          fullName: payload.fullName ?? prev.fullName,
          gstin: payload.gstin ?? prev.gstin,
          panNumber: payload.panNumber ?? prev.panNumber,
          phoneNumber:
            payload.phoneNumber ??
            payload.companyPhoneNumber ??
            prev.phoneNumber,
          latitude: payload.latitude ?? prev.latitude,
          longitude: payload.longitude ?? prev.longitude,
          userType: payload.userType ?? prev.userType,
        }));

        if (typeof payload.companyAddressLine1 === "string") {
          setAddress(payload.companyAddressLine1);
        }

        if (typeof payload.addressLine2 === "string") {
          setAddressLine2(payload.addressLine2);
        }

        if (typeof payload.countryCode === "string") {
          setCountryCode(payload.countryCode);
        }

        if (typeof payload.companyCountryCode === "string") {
          setCountryCode(payload.companyCountryCode);
        }

        if (typeof payload.personalEmail === "string") {
          setPersonalEmail(payload.personalEmail);
        }

        if (typeof payload.companyName === "string") {
          setCompanyName(payload.companyName);
        }

        if (typeof payload.companyEmail === "string") {
          setCompanyEmail(payload.companyEmail);
        }

        if (
          typeof payload.latitude === "number" &&
          typeof payload.longitude === "number"
        ) {
          setPosition({
            lat: payload.latitude,
            lng: payload.longitude,
          });
        }
      } catch (error) {
        console.log("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmitProfile = async () => {
    if (!acceptDeclaration) {
      setSubmitError("Please accept the declaration to continue.");
      setSubmitSuccess(null);
      return;
    }

    if (!panCardFile) {
      setSubmitError("PAN card file is required.");
      setSubmitSuccess(null);
      return;
    }

    if (profile.userType === "ORGANIZATION" && !gstinDocumentFile) {
      setSubmitError("GST document file is required for organizations.");
      setSubmitSuccess(null);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const formData = new FormData();

      formData.append("phoneNumber", profile.phoneNumber);
      formData.append("countryCode", countryCode);
      formData.append("addressLine1", address);
      formData.append("panNumber", profile.panNumber);
      formData.append("latitude", String(position.lat));
      formData.append("longitude", String(position.lng));
      formData.append("panCardFile", panCardFile);

      if (addressLine2.trim()) {
        formData.append("addressLine2", addressLine2.trim());
      }

      if (profile.userType === "INDIVIDUAL") {
        formData.append("fullName", profile.fullName);

        if (personalEmail.trim()) {
          formData.append("personalEmail", personalEmail.trim());
        }

        if (profile.gender.trim()) {
          formData.append("gender", profile.gender.trim());
        }

        if (companyName.trim()) {
          formData.append("companyName", companyName.trim());
        }
      }

      if (profile.userType === "ORGANIZATION") {
        formData.append("companyName", companyName);
        formData.append("companyEmail", companyEmail);
        formData.append("gstin", profile.gstin);

        if (gstinDocumentFile) {
          formData.append("gstinDocumentFile", gstinDocumentFile);
        }
      }

      const response = await api.post(
        "/api/profile/complete",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setSubmitSuccess(
        response.data?.message ||
          "Profile and documents saved successfully.",
      );
    } catch (error) {
      console.log("Error submitting profile:", error);
      setSubmitError("Failed to submit profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const query = mapQuery.trim();

    if (!query) {
      setSearchResults([]);
      setSearchError("Enter an address to search.");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
          query,
        )}`,
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = (await response.json()) as Array<{
        display_name: string;
        lat: string;
        lon: string;
      }>;

      setSearchResults(data);

      if (data.length === 0) {
        setSearchError("No results found.");
      }
    } catch (error) {
      setSearchError("Search failed. Try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    const nextLat = Number(result.lat);
    const nextLng = Number(result.lon);

    if (Number.isFinite(nextLat) && Number.isFinite(nextLng)) {
      setPosition({ lat: nextLat, lng: nextLng });
      setAddress(result.display_name);
      setMapQuery(result.display_name);
      setSearchResults([]);
      setSearchError(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900">

      {/* MAIN */}
      <main className="mx-auto max-w-5xl px-8 py-10">
        {/* TOP SECTION */}
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-bold">
              Authorization Form
            </h1>

            <p className="mt-2 text-slate-500">
              Complete your driver profile for regulatory
              compliance.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800">
            <BadgeCheck className="h-4 w-4" />
            {profile.approvalStatus || "Pending Verification"}
          </div>
        </div>

        {/* STEP INDICATOR */}
        <Card className="mb-8 border-slate-200">
          <CardContent className="relative flex items-center justify-between p-6">
            <div className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-slate-200">
              <div className="h-full w-full bg-[#0070c0]" />
            </div>

            {[
              "Registration",
              "Authentication",
              "Authorization",
            ].map((step, index) => (
              <div
                key={step}
                className="relative z-10 flex flex-col items-center gap-2"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md ${
                    index === 2
                      ? "bg-[#0070c0] text-white ring-4 ring-blue-100"
                      : "bg-[#0070c0] text-white"
                  }`}
                >
                  {index !== 2 ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>3</span>
                  )}
                </div>

                <span className="text-sm font-semibold text-[#005797]">
                  {step}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* PERSONAL INFO */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-3 border-b pb-4">
              <PersonStanding className="text-[#005797]" />

              <h2 className="text-2xl font-semibold">
                Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>

                <Input
                  value={profile.fullName}
                  readOnly
                  className="bg-slate-100"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>

                <Input
                  value={profile.email}
                  readOnly
                  className="bg-slate-100"
                />
              </div>

              <div className="space-y-2">
                <Label>Country Code</Label>

                <Input
                  placeholder="+1"
                  value={countryCode}
                  onChange={(event) =>
                    setCountryCode(event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>

                <Input
                  placeholder="+1 (555) 000-0000"
                  value={profile.phoneNumber}
                  onChange={(event) =>
                    setProfile((prev) => ({
                      ...prev,
                      phoneNumber: event.target.value,
                    }))
                  }
                />
              </div>

              {profile.userType === "INDIVIDUAL" && (
                <>
                  <div className="space-y-2">
                    <Label>Gender</Label>

                    <select
                      value={profile.gender}
                      onChange={(event) =>
                        setProfile((prev) => ({
                          ...prev,
                          gender: event.target.value,
                        }))
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Personal Email</Label>

                    <Input
                      placeholder="personal@email.com"
                      value={personalEmail}
                      onChange={(event) =>
                        setPersonalEmail(event.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Company Name (Optional)</Label>

                    <Input
                      placeholder="Optional company link"
                      value={companyName}
                      onChange={(event) =>
                        setCompanyName(event.target.value)
                      }
                    />
                  </div>
                </>
              )}

              {profile.userType === "ORGANIZATION" && (
                <>
                  <div className="space-y-2">
                    <Label>Company Name</Label>

                    <Input
                      placeholder="Company name"
                      value={companyName}
                      onChange={(event) =>
                        setCompanyName(event.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Company Email</Label>

                    <Input
                      placeholder="company@email.com"
                      value={companyEmail}
                      onChange={(event) =>
                        setCompanyEmail(event.target.value)
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ASSET LOCATION */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="mb-6 flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <MapPin className="text-[#005797]" />

                <h2 className="text-2xl font-semibold">
                  Asset Location
                </h2>
              </div>

              <div className="flex items-center gap-3 rounded-lg border bg-slate-50 px-4 py-2">
                <span className="text-sm text-slate-500">
                  Manual
                </span>

                <Switch
                  checked={mapView}
                  onCheckedChange={setMapView}
                />

                <span className="text-sm font-medium">
                  Map View
                </span>
              </div>
            </div>

            {mapView==false || openMap==true ?  (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Address</Label>

                    <Input
                      placeholder="123 Fleet Street, Springfield"
                      value={address}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setAddress(nextValue);
                        setProfile((prev) => ({
                          ...prev,
                          companyAddressLine1: nextValue,
                        }));
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Address Line 2</Label>

                    <Input
                      placeholder="Apartment, suite, etc."
                      value={addressLine2}
                      onChange={(event) =>
                        setAddressLine2(event.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Latitude</Label>

                      <Input
                        value={position.lat}
                        onChange={(e) =>
                          setPosition((prev) => ({
                            ...prev,
                            lat: Number(e.target.value),
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Longitude</Label>

                      <Input
                        value={position.lng}
                        onChange={(e) =>
                          setPosition((prev) => ({
                            ...prev,
                            lng: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <p className="text-sm text-slate-500">
                    Coordinates are required for precision
                    logging of the fleet asset deployment
                    area.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border bg-slate-50 p-6 text-center">
                  <MapPin className="mb-3 h-10 w-10 text-slate-400" />

                  <p className="text-sm text-slate-500">
                    Switch to Map View for a visual interface
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="w-full space-y-6 md:w-1/2">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Latitude</Label>

                      <Input
                        value={position.lat}
                        readOnly
                        className="bg-slate-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Longitude</Label>

                      <Input
                        value={position.lng}
                        readOnly
                        className="bg-slate-100"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-slate-500">
                    The current coordinates are derived from
                    your map selection.
                  </p>

                  <Button
                    className="w-full bg-[#0070c0] hover:bg-[#005797]"
                    onClick={() => setOpenMap(true)}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Open Interactive Map
                  </Button>
                </div>

                <div className="overflow-hidden rounded-xl border md:w-1/2">
                  <MapContainer
                    center={[
                      position.lat,
                      position.lng,
                    ]}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="h-52 w-full"
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <LocationMarker
                      position={position}
                      setPosition={setPosition}
                    />
                  </MapContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* IDENTITY */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-3 border-b pb-4">
              <BadgeCheck className="text-[#005797]" />

              <h2 className="text-2xl font-semibold">
                Identity Verification
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>PAN Number</Label>

                  <Input
                    placeholder="ABCDE1234F"
                    value={profile.panNumber}
                    onChange={(event) =>
                      setProfile((prev) => ({
                        ...prev,
                        panNumber: event.target.value,
                      }))
                    }
                  />
                </div>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition hover:bg-slate-50">
                  <CloudUpload className="mb-3 h-10 w-10 text-[#0070c0]" />

                  <h4 className="font-semibold">
                    Upload PAN Card
                  </h4>

                  <p className="text-sm text-slate-500">
                    PNG, JPG or PDF up to 5MB
                  </p>
                  {panCardFile && (
                    <p className="mt-2 text-xs text-slate-500">
                      Selected: {panCardFile.name}
                    </p>
                  )}

                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="sr-only"
                    onChange={(event) =>
                      setPanCardFile(
                        event.target.files?.[0] || null,
                      )
                    }
                  />
                </label>
              </div>

              {profile.userType === "ORGANIZATION" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>GSTIN Number</Label>

                    <Input
                      placeholder="22AAAAA0000A1Z5"
                      value={profile.gstin}
                      onChange={(event) =>
                        setProfile((prev) => ({
                          ...prev,
                          gstin: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition hover:bg-slate-50">
                    <CloudUpload className="mb-3 h-10 w-10 text-[#0070c0]" />

                    <h4 className="font-semibold">
                      Upload GST Certificate
                    </h4>

                    <p className="text-sm text-slate-500">
                      PNG, JPG or PDF up to 5MB
                    </p>
                    {gstinDocumentFile && (
                      <p className="mt-2 text-xs text-slate-500">
                        Selected: {gstinDocumentFile.name}
                      </p>
                    )}

                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="sr-only"
                      onChange={(event) =>
                        setGstinDocumentFile(
                          event.target.files?.[0] || null,
                        )
                      }
                    />
                  </label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SUBMIT */}
        <section className="space-y-6">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={acceptDeclaration}
              onCheckedChange={(checked) =>
                setAcceptDeclaration(Boolean(checked))
              }
            />

            <p className="text-sm leading-6 text-slate-600">
              I declare that the information provided is
              accurate and true to the best of my knowledge.
              I understand that any false documentation will
              result in immediate disqualification.
            </p>
          </div>

          {(submitError || submitSuccess) && (
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                submitError
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {submitError || submitSuccess}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline">
              Save as Draft
            </Button>

            <Button
              className="bg-[#0070c0] hover:bg-[#005797]"
              onClick={handleSubmitProfile}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit for Approval"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      {/* MAP DIALOG */}
      
      <Dialog open={openMap} onOpenChange={setOpenMap}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Select Asset Location
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <form className="space-y-3" onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                <Input
                  placeholder="Search for address..."
                  className="pl-10"
                  value={mapQuery}
                  onChange={(event) => setMapQuery(event.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="rounded-md bg-[#0070c0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005797]"
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>

                {searchError && (
                  <span className="text-sm text-red-600">
                    {searchError}
                  </span>
                )}
              </div>
            </form>

            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white">
                {searchResults.map((result) => (
                  <button
                    key={`${result.lat}-${result.lon}`}
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className="flex w-full flex-col gap-1 border-b border-slate-100 px-4 py-3 text-left text-sm hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-700">
                      {result.display_name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {result.lat}, {result.lon}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* REAL MAP */}
            <div className="overflow-hidden rounded-xl border">
              <MapContainer
                center={[position.lat, position.lng]}
                zoom={13}
                scrollWheelZoom={true}
                className="h-[450px] w-full"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LocationMarker
                  position={position}
                  setPosition={setPosition}
                />
              </MapContainer>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                <p>
                  <span className="font-semibold text-slate-700">
                    Lat:
                  </span>{" "}
                  {position.lat.toFixed(6)}
                </p>

                <p>
                  <span className="font-semibold text-slate-700">
                    Long:
                  </span>{" "}
                  {position.lng.toFixed(6)}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  size="icon"
                  className="bg-[#0070c0] hover:bg-[#005797]"
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setPosition({
                          lat: pos.coords.latitude,
                          lng: pos.coords.longitude,
                        });
                      }
                    );
                  }}
                >
                  <LocateFixed className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setOpenMap(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>

                <Button
                  className="bg-[#0070c0] hover:bg-[#005797]"
                  onClick={() => setOpenMap(false)}
                >
                  Confirm Coordinates
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
     

      {/* FOOTER */}
      <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t bg-white px-8 py-6 md:flex-row">
        <div className="flex items-center gap-3">
          <span className="font-semibold">
            FleetOps
          </span>

          <span className="text-sm text-slate-500">
            © 2024 FleetOps Enterprise Systems. All rights reserved.
          </span>
        </div>

        <div className="flex flex-wrap gap-5 text-sm text-slate-500">
          <button className="hover:text-[#005797]">
            Privacy Policy
          </button>

          <button className="hover:text-[#005797]">
            Terms of Service
          </button>

          <button className="hover:text-[#005797]">
            Safety Standards
          </button>

          <button className="hover:text-[#005797]">
            ISO 26262 Compliance
          </button>
        </div>
      </footer>
    </div>
  );
}