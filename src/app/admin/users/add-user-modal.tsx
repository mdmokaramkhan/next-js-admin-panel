import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { roleOptions } from "./columns"; // Assuming roleOptions is imported from columns

interface AddUserDialogProps {
  onSubmit: (formData: any) => void;
  isSubmitting: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  formData: any;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSelectChange: (value: string) => void;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({
  onSubmit,
  isSubmitting,
  isDialogOpen,
  setIsDialogOpen,
  formData,
  handleChange,
  handleSelectChange,
}) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger>
        <div />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new user to the system. Ensure
            all required fields are completed accurately before submission.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => onSubmit(e)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="owner_name" className="text-right">
                Owner Name
              </Label>
              <Input
                id="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                placeholder="John Doe"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email_address" className="text-right">
                Email Address
              </Label>
              <Input
                id="email_address"
                value={formData.email_address}
                onChange={handleChange}
                placeholder="johndoe@example.com"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mobile_number" className="text-right">
                Mobile Number
              </Label>
              <Input
                id="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                placeholder="1234567890"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shop_name" className="text-right">
                Shop Name
              </Label>
              <Input
                id="shop_name"
                value={formData.shop_name}
                onChange={handleChange}
                placeholder="Shop Name"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street, City, Country"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group_code" className="text-right">
                Group Code
              </Label>
              <Select
                onValueChange={handleSelectChange}
                value={formData.group_code}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="callback_url" className="text-right">
                Callback URL
              </Label>
              <Input
                id="callback_url"
                value={formData.callback_url}
                onChange={handleChange}
                placeholder="https://example.com"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding User..." : "Add User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
