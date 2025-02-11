"use client";
import React, { useState, useEffect, useMemo } from "react";
import style from './page.module.css'
import { useApi } from '../../Api/useApi'
import CreateFrom from "../../CreateFrom/createFrom";
import { countries, formateDate, Title, showHide } from '../../utils/Constant'

interface FilterState {
  page: number;
  sortBy: string;
  sortByOrder: "asc" | "desc" | '';
  search?: string;
  filterCountry?: string;
}


export default function Home() {
  const { data, totalPages, refreshData, loading, error, get, post, put, del } = useApi("http://localhost:3002");
  const [formToggle, setFormToggle] = useState(false)
  const [isEdit, setIsEdit] = useState({
    edit: false,
    editData: {}
  })
  const [filter, setFilter] = useState<FilterState>({
    page: 1,
    sortBy: '',
    sortByOrder: '',
    search: '',
    filterCountry: '',
  })
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    showHide.reduce((acc, col) => ({ ...acc, [col.id]: true }), {} as Record<string, boolean>)
  );
  const toggleColumn = (col: string): void => {
    setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.append("_page", filter.page.toString());
    params.append("_limit", "10");
    if (filter.sortBy) params.append("_sort", filter.sortBy);
    if (filter.sortByOrder) params.append("_order", filter.sortByOrder);
    if (filter.search) params.append("q", filter.search);
    if (filter.filterCountry) params.append("country", filter.filterCountry);
    get(`/locations?${params.toString()}`)
  }, [filter, refreshData]);

  function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | undefined;
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }
  const handleSearch = (text: string) => {
    setFilter({ ...filter, search: text })
  }
  const debouncedLog = debounce(handleSearch, 1000);

  const getPageNumbers = useMemo(() => {
    const maxVisiblePages = 1;
    const pages = [];
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (filter.page <= 3) {
      pages.push(1, 2, 3, "...", totalPages);
    } else if (filter.page >= totalPages - 2) {
      pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", filter.page - 1, filter.page, filter.page + 1, "...", totalPages);
    }
    return pages;
  }, [filter, totalPages]);

  if (loading) {
    return <p>Loading...</p>
  }
  return (
    <>
      {error && alert(<p style={{ color: "red" }}>{error}</p>)}
      {formToggle ? (
        <CreateFrom setFormToggle={setFormToggle} post={post} put={put} setIsEdit={setIsEdit} isEdit={isEdit} />
      ) : (
        <div className={style["table-container"]}>
          <div className={style["toggle-container"]}>
            <strong>Show/Hide Columns:</strong>
            {showHide.map(({ id, label }) => (
              <label key={id} className={style["toggle-label"]}>
                <input
                  type="checkbox"
                  checked={visibleColumns[id]}
                  onChange={() => toggleColumn(id)}
                />
                {label}
              </label>
            ))}
          </div>
          <div className={style["controls"]}>
            <input
              type="text"
              placeholder="Search here..."
              onChange={(e) => debouncedLog(e.target.value)}
              className={style["search-input"]}
            />
            <div className={style['filter-container']}>
              <select
                className={style["dropdown"]}
                value={filter?.sortBy}
                onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
              >
                <option value="">Sort By</option>
                <option value="name">Name</option>
                <option value="country">Country</option>
                <option value="city">City</option>
                <option value="province">Province</option>
                <option value="code">Code</option>
              </select>
              <select className={style["dropdown"]}
                value={filter?.sortByOrder}
                onChange={(e) => setFilter({ ...filter, sortByOrder: e.target.value as "asc" | "desc" })}
              >
                <option value="">Sort By</option>
                <option value="asc">A to Z</option>
                <option value="desc">Z to A</option>
              </select>
              <select className={style["dropdown"]}
                value={filter?.filterCountry}
                onChange={(e) => setFilter({ ...filter, filterCountry: e.target.value })}
              >
                <option value="">Filter By Countries</option>
                {countries?.map((e, i) => (
                  <option value={e} key={i}>{e}</option>
                ))}
              </select>
              <button
                className={style['button']}
                onClick={() => setFilter({
                  page: 1,
                  sortBy: '',
                  sortByOrder: '',
                  search: '',
                  filterCountry: '',
                })}>Reset All Filter</button>
              <button
                className={style['button']}
                onClick={() => setFormToggle(true)}

              >Add Data</button>
            </div>
          </div>

          <table className={style["custom-table"]}>
            <thead>
              <tr>
                {Title.map((e, i) => (
                  (!showHide.some((item) => item.label === e) || visibleColumns[e.toLowerCase()])) && (
                    <th key={i}>{e}</th>
                  ))
                }
              </tr>
            </thead>
            <tbody>
              {data?.map((item, index) => (
                <tr key={index}>
                  {visibleColumns.name && <td>{item?.name}</td>}
                  {visibleColumns.city && <td>{item?.city}</td>}
                  {visibleColumns.country && <td>{item?.country}</td>}
                  {visibleColumns.province && <td>{item?.province ?? "-------"}</td>}
                  {visibleColumns.code && <td>{item?.code ?? "-------"}</td>}
                  <td>{formateDate(item?.updatedAt)}</td>
                  <td>
                    <button className={style['delete-btn']} onClick={() => del(`/locations/${item?.id}`)}>Delete</button>
                    <button className={style['edit-btn']} onClick={() => {
                      setIsEdit({ edit: true, editData: item });
                      setFormToggle(true)
                    }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={style["pagination"]}>
            <button onClick={() => setFilter({ ...filter, page: filter.page - 1 })} disabled={filter.page === 1}>
              {"<"}
            </button>

            {getPageNumbers.map((num, i) => (
              <button
                key={i}
                onClick={() => typeof num === "number" && setFilter({ ...filter, page: num })}
                className={filter.page === num ? style["active"] : ""}
                disabled={num === "..."}
              >
                {num}
              </button>
            ))}

            <button onClick={() => setFilter({ ...filter, page: filter.page + 1 })} disabled={filter.page === totalPages}>
              {">"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
