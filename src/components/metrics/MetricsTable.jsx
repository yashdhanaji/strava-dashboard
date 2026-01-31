import SparklineChart from './SparklineChart';
import './MetricsSection.css';

const StatusIcon = ({ status }) => {
    switch (status) {
        case 'optimal':
            return <span className="status-icon status-icon--optimal">✓</span>;
        case 'in_range':
            return <span className="status-icon status-icon--in-range">~</span>;
        case 'out_of_range':
            return <span className="status-icon status-icon--out-of-range">!</span>;
        default:
            return <span className="status-icon">-</span>;
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'optimal':
            return 'Optimal';
        case 'in_range':
            return 'In range';
        case 'out_of_range':
            return 'Out of range';
        default:
            return '-';
    }
};

const getSparklineColor = (status) => {
    switch (status) {
        case 'optimal':
            return 'var(--color-optimal)';
        case 'in_range':
            return 'var(--color-in-range)';
        case 'out_of_range':
            return 'var(--color-out-of-range)';
        default:
            return 'var(--color-accent-blue)';
    }
};

const MetricsTable = ({ metrics = [], sortColumn, sortDirection, onSort }) => {
    if (metrics.length === 0) {
        return (
            <div className="metrics-table-empty">
                <p>No metrics available. Start logging activities to see your performance data.</p>
            </div>
        );
    }

    const handleSort = (column) => {
        if (onSort) {
            onSort(column);
        }
    };

    return (
        <div className="metrics-table-container">
            <table className="metrics-table">
                <thead>
                    <tr>
                        <th onClick={() => handleSort('name')} className="sortable">
                            Name {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('status')} className="sortable">
                            Status {sortColumn === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>History</th>
                        <th onClick={() => handleSort('value')} className="sortable">
                            Value {sortColumn === 'value' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Range</th>
                    </tr>
                </thead>
                <tbody>
                    {metrics.map((metric) => (
                        <tr key={metric.id} className={`metrics-row metrics-row--${metric.status}`}>
                            <td className="metric-name">
                                {metric.name}
                            </td>
                            <td className="metric-status">
                                <div className={`status-badge status-badge--${metric.status}`}>
                                    <StatusIcon status={metric.status} />
                                    <span className="status-text">{getStatusLabel(metric.status)}</span>
                                </div>
                            </td>
                            <td className="metric-history">
                                <SparklineChart
                                    data={metric.history}
                                    color={getSparklineColor(metric.status)}
                                    width={80}
                                    height={30}
                                />
                            </td>
                            <td className="metric-value">
                                {metric.value}
                            </td>
                            <td className="metric-range">
                                {metric.range}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MetricsTable;
