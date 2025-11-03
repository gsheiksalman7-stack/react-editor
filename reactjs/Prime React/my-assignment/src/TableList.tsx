import { useEffect, useRef, useState } from "react"
import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputNumber } from "primereact/inputnumber";

interface Data {
    id: number,
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}

export default function TableList() {
    const [list, setList] = useState<Data[]>([])
    const [loading, setLoading] = useState(false)
    const [totalRecords, setTotalRecords] = useState(0)
    const [page, setPage] = useState(0)
    const [selectedRows, setSelectedRows] = useState<any[]>([])
    const [numericValue, setNumericValue] = useState<number>(0)

    const fetchData = async (pageNumber: number) => {
        setLoading(true)
        try {
            const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${pageNumber + 1}`)
            const json = await res.json()
            setList(json.data)
            setTotalRecords(json.pagination.total)
        } catch (err) {
            console.log('Failed to Fetch Data', err)
        } finally {
            setLoading(false)
        }
    }

    const selectedRowsAcrossPages = async (count: number) => {
        let selected: Data[] = []
        let currentPage = 0

        while (selected.length < count) {
            const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${currentPage + 1}`);
            const json = await res.json();
            const pageData: Data[] = json.data

            const remaining = count - selected.length
            selected = [...selected, ...pageData.slice(0, remaining)]

            if (!json.pagination || !json.pagination.next_url || pageData.length < 1) {
                break
            }
            currentPage++
        }
        setSelectedRows(selected)
    }

    useEffect(() => {
        fetchData(page)
    }, [page])

    const onPageChange = (e: DataTablePageEvent) => {
        setPage(e.page ?? 0)
    }

    const op = useRef<OverlayPanel>(null)

    const selectionHeader = (
        <div className="flex justify-between items-center w-full">
            <Button icon='pi pi-chevron-down' className="p-button-sm p-button-text" onClick={(e) => op.current?.toggle(e)}
                aria-haspopup
                aria-controls="dropdown-panel" />
            <OverlayPanel ref={op} id="dropdown-panel" style={{ width: '300px' }}>
                <div className="p-3 space-y-1">
                    <span className="p-float-label">
                        <InputNumber id="numericInput" onValueChange={(e) => setNumericValue(e.value ?? 0)}
                            value={numericValue} useGrouping={false} min={0} />
                        <label htmlFor="numericInput">Select Rows</label>
                    </span>
                    <Button
                        label="Submit"
                        className="w-full"
                        onClick={() => { selectedRowsAcrossPages(numericValue); op.current?.hide() }}
                    />
                </div>
            </OverlayPanel>
        </div>
    )

    return (
        <div className="p-6">
            <DataTable value={list} paginator rows={12} totalRecords={totalRecords}
                lazy first={page * 12} onPage={onPageChange} loading={loading} dataKey='id'
                selection={selectedRows} onSelectionChange={(e) => setSelectedRows(e.value)}>
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                <Column header={selectionHeader} />
                <Column field="title" header="Title" />
                <Column field="place_of_origin" header="Origin" />
                <Column field="artist_display" header="Artist" />
                <Column field="inscriptions" header="Inscriptions" />
                <Column field="date_start" header="Start Date" />
                <Column field="date_end" header="End Date" />
            </DataTable>
        </div>
    )
}