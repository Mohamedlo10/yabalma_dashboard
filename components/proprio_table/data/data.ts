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
      value: "info",
      label: "info",
      icon: ShieldCheck,
    },
    {
      value: "error",
      label: "error",
      icon: CircleIcon,
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