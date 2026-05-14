// SignupPage.tsx

import { useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";

type IndividualPayload = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  countryCode: string;
  role: string;
  gender: string;
  userType: string;
};

type OrganizationPayload = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  countryCode: string;
  role: string;
  userType: string;
};

const DEFAULT_USER_TYPE = "ORGANIZATION";

const Signup = () => {
  const [accountType, setAccountType] = useState("individual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [individualForm, setIndividualForm] = useState<IndividualPayload>({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    countryCode: "+1",
    role: "",
    gender: "",
    userType: DEFAULT_USER_TYPE,
  });

  const [organizationForm, setOrganizationForm] = useState<OrganizationPayload>({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    countryCode: "+1",
    role: "",
    userType: DEFAULT_USER_TYPE,
  });

  const signupUrl = useMemo(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    return `${baseUrl.replace(/\/$/, "")}/api/auth/signup`;
  }, []);

  useEffect(() => {
    setSubmitError(null);
    setSubmitSuccess(null);
    setIndividualForm((prev) => ({
      ...prev,
      userType: DEFAULT_USER_TYPE,
    }));
    setOrganizationForm((prev) => ({
      ...prev,
      userType: DEFAULT_USER_TYPE,
    }));
  }, [accountType]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const payload = accountType === "individual" ? individualForm : organizationForm;

    try {
      await axios.post(signupUrl, payload);
      setSubmitSuccess("Account created successfully.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSubmitError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Signup failed. Please try again.",
        );
      } else {
        setSubmitError("Signup failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      
      {/* Background Blur */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-yellow-400 blur-[120px]" />
      </div>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <Card className="w-full max-w-3xl shadow-xl border-0 overflow-hidden">
          
          <CardContent className="p-0">

            {/* Header */}
            <div className="p-8 text-center border-b">
              <div className="flex justify-center mb-4">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9SPFl3w-Xe8fFygrPurTmozHrTnRh40vTPFMPPpEKSgw3eU7oiOieJ4EAMUsdtOHV3Pf_iX79nAV4F7K6FB_XAdTBls4szoR7_UvF4q8_TE1-U50j54YC_ZwQhIhExbE92IQ7ozr6i7GQ4TFXCpin9QhxNZndFy7K0vn4JhpyMn64u-wHP8IATeGrPRugWa62DxH43oqI2ATj1Zqg2erEV_ompWpjTmNc2dFjT092yGF2cp1JUMD8rhR_1t-zTn0sb_D-6K9vbeSU"
                  alt="logo"
                  className="h-16"
                />
              </div>

              <h1 className="text-3xl font-bold text-blue-700">
               FleetOps EV Fleet Incident Management
              </h1>

              <p className="text-muted-foreground mt-2">
                Create your account
              </p>
            </div>

            {/* Tabs */}
            <Tabs
              defaultValue="individual"
              value={accountType}
              onValueChange={setAccountType}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full rounded-none h-14">
                <TabsTrigger value="individual">
                  Individual Account
                </TabsTrigger>

                <TabsTrigger value="organization">
                  Organization Account
                </TabsTrigger>
              </TabsList>

              {/* Individual Form */}
              <TabsContent value="individual">
                <form className="p-8 space-y-6" onSubmit={handleSubmit}>

                  {/* Name + Email */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        placeholder="Alexander Pierce"
                        value={individualForm.fullName}
                        onChange={(event) =>
                          setIndividualForm((prev) => ({
                            ...prev,
                            fullName: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        placeholder="alexander@volttrack.com"
                        value={individualForm.email}
                        onChange={(event) =>
                          setIndividualForm((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Password + Phone */}
                  <div className="grid md:grid-cols-2 gap-5">

                    <div className="space-y-2">
                      <Label>Password</Label>

                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={individualForm.password}
                        onChange={(event) =>
                          setIndividualForm((prev) => ({
                            ...prev,
                            password: event.target.value,
                          }))
                        }
                      />

                      <p className="text-sm text-muted-foreground">
                        Minimum 8 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Number</Label>

                      <div className="flex gap-2">
                        <Select
                          value={individualForm.countryCode}
                          onValueChange={(value) =>
                            setIndividualForm((prev) => ({
                              ...prev,
                              countryCode: value,
                            }))
                          }
                        >
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="+1" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="+1">
                              +1
                            </SelectItem>

                            <SelectItem value="+44">
                              +44
                            </SelectItem>

                            <SelectItem value="+49">
                              +49
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="555-000-0000"
                          value={individualForm.phoneNumber}
                          onChange={(event) =>
                            setIndividualForm((prev) => ({
                              ...prev,
                              phoneNumber: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role + Company */}
                  <div className="grid md:grid-cols-2 gap-5">

                    <div className="space-y-2">
                      <Label>Role</Label>

                      <Select
                        value={individualForm.role}
                        onValueChange={(value) =>
                          setIndividualForm((prev) => ({
                            ...prev,
                            role: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="driver">
                            Driver
                          </SelectItem>

                          <SelectItem value="contractor">
                            Contractor
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Gender</Label>

                      <Select
                        value={individualForm.gender}
                        onValueChange={(value) =>
                          setIndividualForm((prev) => ({
                            ...prev,
                            gender: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start space-x-3">
                    <Checkbox id="terms1" />

                    <label
                      htmlFor="terms1"
                      className="text-sm text-muted-foreground leading-relaxed"
                    >
                      I agree to the{" "}
                      <span className="text-blue-600 font-medium cursor-pointer">
                        Terms
                      </span>{" "}
                      and{" "}
                      <span className="text-blue-600 font-medium cursor-pointer">
                        Privacy Policy
                      </span>
                    </label>
                  </div>

                  <Button className="w-full h-12" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Creating Account..."
                      : "Create Individual Account"}
                  </Button>

                  {submitError && (
                    <p className="text-sm text-red-600 text-center">
                      {submitError}
                    </p>
                  )}

                  {submitSuccess && (
                    <p className="text-sm text-green-600 text-center">
                      {submitSuccess}
                    </p>
                  )}

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login">
                    <span className="text-blue-600 cursor-pointer font-medium">
                      Log In
                    </span>
                    </Link>
                  </p>
                </form>
              </TabsContent>

              {/* Organization Form */}
              <TabsContent value="organization">
                <form className="p-8 space-y-6" onSubmit={handleSubmit}>

                  {/* Name + Email */}
                  <div className="grid md:grid-cols-2 gap-5">

                    <div className="space-y-2">
                      <Label>Full Name</Label>

                      <Input
                        placeholder="Admin Contact Name"
                        value={organizationForm.fullName}
                        onChange={(event) =>
                          setOrganizationForm((prev) => ({
                            ...prev,
                            fullName: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email Address</Label>

                      <Input
                        type="email"
                        placeholder="admin@company.com"
                        value={organizationForm.email}
                        onChange={(event) =>
                          setOrganizationForm((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Password + Phone */}
                  <div className="grid md:grid-cols-2 gap-5">

                    <div className="space-y-2">
                      <Label>Password</Label>

                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={organizationForm.password}
                        onChange={(event) =>
                          setOrganizationForm((prev) => ({
                            ...prev,
                            password: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Number</Label>

                      <div className="flex gap-2">

                        <Select
                          value={organizationForm.countryCode}
                          onValueChange={(value) =>
                            setOrganizationForm((prev) => ({
                              ...prev,
                              countryCode: value,
                            }))
                          }
                        >
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="+1" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="+1">
                              +1
                            </SelectItem>

                            <SelectItem value="+44">
                              +44
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Company Line"
                          value={organizationForm.phoneNumber}
                          onChange={(event) =>
                            setOrganizationForm((prev) => ({
                              ...prev,
                              phoneNumber: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role + Gender */}
                  <div className="grid md:grid-cols-2 gap-5">

                    <div className="space-y-2">
                      <Label>Role</Label>

                      <Select
                        value={organizationForm.role}
                        onValueChange={(value) =>
                          setOrganizationForm((prev) => ({
                            ...prev,
                            role: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="supervisor">
                            Supervisor
                          </SelectItem>

                          <SelectItem value="fleet_manager">
                            Fleet Manager
                          </SelectItem>

                          <SelectItem value="director">
                            Director
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Company Name</Label>

                      <Input placeholder="Current employer" />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start space-x-3">
                    <Checkbox id="terms2" />

                    <label
                      htmlFor="terms2"
                      className="text-sm text-muted-foreground leading-relaxed"
                    >
                      Registering as an official{" "}
                      <span className="text-blue-600 font-medium cursor-pointer">
                        fleet partner
                      </span>
                    </label>
                  </div>

                  <Button className="w-full h-12" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Creating Account..."
                      : "Create Organization Account"}
                  </Button>

                  {submitError && (
                    <p className="text-sm text-red-600 text-center">
                      {submitError}
                    </p>
                  )}

                  {submitSuccess && (
                    <p className="text-sm text-green-600 text-center">
                      {submitSuccess}
                    </p>
                  )}

                  <p className="text-center text-sm text-muted-foreground">
                    Need help?{" "}
                    <span className="text-blue-600 cursor-pointer font-medium">
                      Contact Support
                    </span>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <p className="text-sm text-muted-foreground">
            © 2024 FleetOps Enterprise Systems. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <span className="hover:text-blue-600 cursor-pointer">
              Privacy Policy
            </span>

            <span className="hover:text-blue-600 cursor-pointer">
              Terms of Service
            </span>

            <span className="hover:text-blue-600 cursor-pointer">
              Fleet Safety Standards
            </span>
          </div>
        </div>
      </footer>

      {/* Side Image */}
      <div className="fixed top-20 right-10 w-96 h-96 opacity-20 hidden xl:block">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA91cwk3WeGLWAKrFQcO8JWC477P6z9Nhhqw717vKDbqk07s9gaBa81M4Ha2HTzywCNjODgcLeZtEC1ngyAXwLpqAGWevgHlKDCOfhDGDGPJmUH0TZQ2XYg1-gt3nMj-BK-T8uRHTpU-eFJ5oKzPYAfoxkwRKfESoILQsSQi7xVE-_9spoksKR304f6N8s6ORr3X7sHSWtZmTWAsi6xhXQTgO5VguHRugF8t_KrC8b0VIPKs-ARdAppCOCPtufucw2Bm5yE9rCWwWS5"
          alt="EV charging"
          className="rounded-3xl object-cover w-full h-full grayscale"
        />
      </div>
    </div>
  );
};

export default Signup;