import './MetricsSection.css';

const MetricsFilterRow = ({ searchQuery, onSearchChange, categoryFilter, onCategoryChange, statusFilter, onStatusChange }) => {
    return (
        <div className="metrics-filter">
            <div className="metrics-filter__search">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search metrics..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="metrics-filter__dropdowns">
                <select
                    value={categoryFilter}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Categories</option>
                    <option value="running">Running</option>
                    <option value="cycling">Cycling</option>
                    <option value="heart">Heart Rate</option>
                    <option value="volume">Volume</option>
                    <option value="training">Training</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Results</option>
                    <option value="optimal">Optimal</option>
                    <option value="in_range">In Range</option>
                    <option value="out_of_range">Out of Range</option>
                </select>
            </div>
        </div>
    );
};

export default MetricsFilterRow;
