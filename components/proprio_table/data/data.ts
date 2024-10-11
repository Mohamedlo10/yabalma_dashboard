import {
    ArrowDownIcon,
    ArrowRightIcon,
    ArrowUpIcon,
    CheckCircledIcon,
    CircleIcon,
    CrossCircledIcon,
    ArchiveIcon,
    StopwatchIcon,
  } from "@radix-ui/react-icons"
  import { ShieldCheck ,LogIn , LogOut  } from 'lucide-react';
  
  export const labels = [
    {
      value: "bug",
      label: "Bug",
    },
    {
      value: "feature",
      label: "Feature",
    },
    {
      value: "documentation",
      label: "Documentation",
    },
  ]
  
  export const statuses = [
    {
      value: "Clean",
      label: "Clean",
      icon: ShieldCheck,
    },
    {
      value: "Inspected",
      label: "Inspected",
      icon: CircleIcon,
    },
    {
      value: "Service",
      label: "Out of Service",
      icon: StopwatchIcon,
    },
    {
      value: "dirty",
      label: "Dirty",
      icon: CheckCircledIcon,
    },
    {
      value: "cleanup",
      label: "Clean up",
      icon: CrossCircledIcon,
    },
  ]
  
  export const priorities = [
    {
      label: "Not Reserved",
      value: "Not Reserved",
      icon: ArchiveIcon,
    },
    {
      label: "In house",
      value: "In house",
      icon: LogIn,
    },
    {
      label: "Impossible",
      value: "Impossible",
      icon: LogOut ,
    },
  ]