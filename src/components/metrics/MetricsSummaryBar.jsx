import './MetricsSection.css';

const MetricsSummaryBar = ({ total = 0, optimal = 0, inRange = 0, outOfRange = 0 }) => {
    const totalCount = total || (optimal + inRange + outOfRange);
    const optimalPercent = totalCount > 0 ? (optimal / totalCount) * 100 : 0;
    const inRangePercent = totalCount > 0 ? (inRange / totalCount) * 100 : 0;
    const outOfRangePercent = totalCount > 0 ? (outOfRange / totalCount) * 100 : 0;

    return (
        <div className="metrics-summary">
            <div className="metrics-summary__counts">
                <div className="summary-count summary-count--total">
                    <span className="count-value">{totalCount}</span>
                    <span className="count-label">Total</span>
                </div>
                <div className="summary-count summary-count--optimal">
                    <span className="count-value">{optimal}</span>
                    <span className="count-label">Optimal</span>
                </div>
                <div className="summary-count summary-count--in-range">
                    <span className="count-value">{inRange}</span>
                    <span className="count-label">In range</span>
                </div>
                <div className="summary-count summary-count--out-of-range">
                    <span className="count-value">{outOfRange}</span>
                    <span className="count-label">Out of range</span>
                </div>
            </div>

            <div className="metrics-summary__bar">
                <div
                    className="bar-segment bar-segment--optimal"
                    style={{ width: `${optimalPercent}%` }}
                />
                <div
                    className="bar-segment bar-segment--in-range"
                    style={{ width: `${inRangePercent}%` }}
                />
                <div
                    className="bar-segment bar-segment--out-of-range"
                    style={{ width: `${outOfRangePercent}%` }}
                />
            </div>
        </div>
    );
};

export default MetricsSummaryBar;
