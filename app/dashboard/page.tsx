import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
    Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Page() {
  return (
    <>
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <Breadcrumb>
                        <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>October 2024</BreadcrumbPage>
                        </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    
                    <Table className="text-center">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px] text-center">Brand</TableHead>
                                <TableHead className="w-[100px] text-center">Colour</TableHead>
                                <TableHead className="w-[100px] text-center">Type</TableHead>
                                <TableHead className="w-[100px] text-center">Cost /kg</TableHead>
                                <TableHead className="w-[100px] text-center">Flow %</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="hover:bg-background">
                                <TableCell className="border-1">
                                    <Popover>
                                        <PopoverTrigger>
                                                TwoTrees
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <Input></Input>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                                <TableCell>Black</TableCell>
                                <TableCell>PLA</TableCell>
                                <TableCell>R299</TableCell>
                                <TableCell>98%</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </SidebarInset>
        </SidebarProvider>
    </>
  )
}