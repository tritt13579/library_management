// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Loader2 } from "lucide-react";
// import { supabaseClient } from "@/lib/client";

// // Define interface for system settings
// interface SystemSetting {
//   setting_id: number;
//   setting_name: string;
//   setting_value: string;
//   data_type: string;
//   description: string | null;
// }

// const SettingPage = () => {
//   const [settings, setSettings] = useState<SystemSetting[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [saving, setSaving] = useState<Record<number, boolean>>({});
//   const { toast } = useToast();

//   useEffect(() => {
//     fetchSettings();
//   }, []);

//   const fetchSettings = async () => {
//     try {
//       const supabase = supabaseClient();
//       const { data, error } = await supabase
//         .from("SystemSetting")
//         .select("*")
//         .order("setting_name");

//       if (error) {
//         throw error;
//       }

//       setSettings(data || []);
//     } catch (error) {
//       console.error("Error fetching settings:", error);
//       toast({
//         title: "Error",
//         description: "Failed to load settings. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateSetting = async (settingId: number, newValue: string) => {
//     try {
//       setSaving((prev) => ({ ...prev, [settingId]: true }));
//       const supabase = supabaseClient();

//       const { error } = await supabase
//         .from("SystemSetting")
//         .update({ setting_value: newValue })
//         .eq("setting_id", settingId);

//       if (error) {
//         throw error;
//       }

//       // Update local state
//       setSettings(
//         settings.map((setting) =>
//           setting.setting_id === settingId
//             ? { ...setting, setting_value: newValue }
//             : setting,
//         ),
//       );

//       toast({
//         title: "Success",
//         description: "Setting updated successfully",
//       });
//     } catch (error) {
//       console.error("Error updating setting:", error);
//       toast({
//         title: "Error",
//         description: "Failed to update setting. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setSaving((prev) => ({ ...prev, [settingId]: false }));
//     }
//   };

//   const handleValueChange = (settingId: number, value: string) => {
//     setSettings(
//       settings.map((setting) =>
//         setting.setting_id === settingId
//           ? { ...setting, setting_value: value }
//           : setting,
//       ),
//     );
//   };

//   // Render the appropriate input based on data type
//   const renderInput = (setting: SystemSetting) => {
//     switch (setting.data_type.toLowerCase()) {
//       case "boolean":
//         return (
//           <div className="flex items-center space-x-2">
//             <Switch
//               id={`setting-${setting.setting_id}`}
//               checked={setting.setting_value.toLowerCase() === "true"}
//               onCheckedChange={(checked) => {
//                 handleValueChange(setting.setting_id, checked.toString());
//                 updateSetting(setting.setting_id, checked.toString());
//               }}
//             />
//             <Label htmlFor={`setting-${setting.setting_id}`}>
//               {setting.setting_value.toLowerCase() === "true"
//                 ? "Enabled"
//                 : "Disabled"}
//             </Label>
//           </div>
//         );
//       case "number":
//         return (
//           <Input
//             type="number"
//             value={setting.setting_value}
//             onChange={(e) =>
//               handleValueChange(setting.setting_id, e.target.value)
//             }
//             onBlur={() =>
//               updateSetting(setting.setting_id, setting.setting_value)
//             }
//           />
//         );
//       case "select":
//         // Assuming options are stored as comma-separated values in the description field
//         const options =
//           setting.description?.split(",").map((opt) => opt.trim()) || [];
//         return (
//           <Select
//             value={setting.setting_value}
//             onValueChange={(value) => {
//               handleValueChange(setting.setting_id, value);
//               updateSetting(setting.setting_id, value);
//             }}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Select an option" />
//             </SelectTrigger>
//             <SelectContent>
//               {options.map((option) => (
//                 <SelectItem key={option} value={option}>
//                   {option}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         );
//       case "textarea":
//       case "text-area":
//         return (
//           <Textarea
//             value={setting.setting_value}
//             onChange={(e) =>
//               handleValueChange(setting.setting_id, e.target.value)
//             }
//             onBlur={() =>
//               updateSetting(setting.setting_id, setting.setting_value)
//             }
//           />
//         );
//       case "text":
//       default:
//         return (
//           <Input
//             type="text"
//             value={setting.setting_value}
//             onChange={(e) =>
//               handleValueChange(setting.setting_id, e.target.value)
//             }
//             onBlur={() =>
//               updateSetting(setting.setting_id, setting.setting_value)
//             }
//           />
//         );
//     }
//   };

//   if (loading) {
//     return (
//       <div className="space-y-4 p-4">
//         <Skeleton className="h-12 w-full" />
//         {[1, 2, 3, 4].map((i) => (
//           <Card key={i}>
//             <CardHeader>
//               <Skeleton className="h-6 w-1/3" />
//               <Skeleton className="h-4 w-2/3" />
//             </CardHeader>
//             <CardContent>
//               <Skeleton className="h-10 w-full" />
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-4">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">System Settings</h1>
//       </div>

//       {settings.length === 0 ? (
//         <Card>
//           <CardContent className="pt-6">
//             <p className="text-center text-muted-foreground">
//               No settings found. Please add settings to the database.
//             </p>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid gap-4 md:grid-cols-2">
//           {settings.map((setting) => (
//             <Card key={setting.setting_id}>
//               <CardHeader>
//                 <CardTitle>{setting.setting_name}</CardTitle>
//                 {setting.description && (
//                   <CardDescription>
//                     {setting.data_type !== "select"
//                       ? setting.description
//                       : "Select an option"}
//                   </CardDescription>
//                 )}
//               </CardHeader>
//               <CardContent>
//                 <div className="flex items-center space-x-2">
//                   <div className="flex-grow">{renderInput(setting)}</div>
//                   {saving[setting.setting_id] && (
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SettingPage;
