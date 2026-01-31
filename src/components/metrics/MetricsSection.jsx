import { useState, useMemo } from 'react';
import MetricsSummaryBar from './MetricsSummaryBar';
import MetricsFilterRow from './MetricsFilterRow';
import MetricsTable from './MetricsTable';
import './MetricsSection.css';

const MetricsSection = ({ metrics = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortColumn, setSortColumn] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    // Calculate summary counts
    const summaryCounts = useMemo(() => {
        const optimal = metrics.filter(m => m.status === 'optimal').length;
        const inRange = metrics.filter(m => m.status === 'in_range').length;
        const outOfRange = metrics.filter(m => m.status === 'out_of_range').length;
        return { total: metrics.length, optimal, inRange, outOfRange };
    }, [metrics]);

    // Filter and sort metrics
    const filteredMetrics = useMemo(() => {
        let filtered = [...metrics];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                m.name.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(m => m.category === categoryFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(m => m.status === statusFilter);
        }

        // Sort
        const statusOrder = { optimal: 1, in_range: 2, out_of_range: 3 };
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortColumn) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'status':
                    comparison = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
                    break;
                case 'value':
                    comparison = (a.numericValue || 0) - (b.numericValue || 0);
                    break;
                default:
                    comparison = 0;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [metrics, searchQuery, categoryFilter, statusFilter, sortColumn, sortDirection]);

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    return (
        <div className="metrics-section">
            <h2 className="metrics-section__title">Performance Metrics</h2>

            <MetricsSummaryBar
                total={summaryCounts.total}
                optimal={summaryCounts.optimal}
                inRange={summaryCounts.inRange}
                outOfRange={summaryCounts.outOfRange}
            />

            <MetricsFilterRow
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
            />

            <MetricsTable
                metrics={filteredMetrics}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
            />
        </div>
    );
};

export default MetricsSection;
