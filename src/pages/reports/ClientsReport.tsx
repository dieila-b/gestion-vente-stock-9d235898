
import { useClientReport } from "./hooks/useClientReport";
import { ClientReportHeader } from "./components/ClientReportHeader";
import { ClientReportFilter } from "./components/ClientReportFilter";
import { ClientReportSummary } from "./components/ClientReportSummary";
import { ClientInvoicesTable } from "./components/ClientInvoicesTable";
import { ClientReportPagination } from "./components/ClientReportPagination";

export default function ClientsReport() {
  const {
    selectedClient,
    setSelectedClient,
    date,
    setDate,
    clients,
    isLoadingClients,
    isLoading,
    clientInvoices,
    totals,
    currentPage,
    totalPages,
    itemsPerPage,
    sortField,
    sortDirection,
    handleSort,
    handlePrint,
    handleExport,
    handlePageChange,
    handleItemsPerPageChange
  } = useClientReport();

  if (isLoading && selectedClient) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Synthèse Clients</h1>
        <div className="mt-4">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <ClientReportHeader 
        date={date}
        handlePrint={handlePrint}
        handleExport={handleExport}
      />

      <ClientReportFilter
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        date={date}
        setDate={setDate}
        clients={clients}
        isLoadingClients={isLoadingClients}
      />

      <div id="client-report" className="space-y-8">
        <ClientReportSummary totals={totals} />

        <ClientInvoicesTable
          invoices={clientInvoices}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          selectedClient={selectedClient}
        />

        {clientInvoices.length > 0 && (
          <ClientReportPagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            handlePageChange={handlePageChange}
            handleItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
    </div>
  );
}
