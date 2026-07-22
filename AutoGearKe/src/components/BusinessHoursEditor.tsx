import React, { useState, useEffect } from 'react';
import { DAYS_OF_WEEK } from '../../types';

interface BusinessHours {
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  available_on_request: boolean;
}

interface BusinessHoursEditorProps {
  hours: BusinessHours[];
  onChange: (hours: BusinessHours[]) => void;
  disabled?: boolean;
  is24_7?: boolean;
  on24_7Change?: (value: boolean) => void;
}

// Generate time options from 6 AM to 8 PM
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 6; hour <= 20; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const h = hour.toString().padStart(2, '0');
      const m = min.toString().padStart(2, '0');
      times.push({ value: `${h}:${m}`, label: `${h}:${m}` });
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

export const BusinessHoursEditor: React.FC<BusinessHoursEditorProps> = ({ 
    hours, 
    onChange,
    disabled = false,
    is24_7 = false
  }) => {
    // Initialize with all days of the week
    const [localHours, setLocalHours] = useState<BusinessHours[]>(() => {
      if (hours && hours.length > 0) {
        return hours;
      }
      // Default: all days closed
      return DAYS_OF_WEEK.map(day => ({
        day_of_week: day.value,
        is_open: false,
        open_time: null,
        close_time: null,
        available_on_request: false,
      }));
    });

    const [is24_7Mode, setIs24_7Mode] = useState<boolean>(is24_7);

    useEffect(() => {
      if (hours && hours.length > 0) {
        setLocalHours(hours);
      }
      // Update 24/7 mode if prop changes
      setIs24_7Mode(is24_7);
    }, [hours, is24_7]);

    const handleToggleDay = (dayValue: number) => {
      // If in 24/7 mode, disabling it when toggling a day
      if (is24_7Mode) {
        setIs24_7Mode(false);
        if (on24_7Change) on24_7Change(false);
      }
      
      const updated = localHours.map(h => {
        if (h.day_of_week === dayValue) {
          if (h.is_open) {
            // Closing the day - reset times and available_on_request
            return { ...h, is_open: false, open_time: null, close_time: null, available_on_request: false };
          } else {
            // Opening the day - set default times
            return { ...h, is_open: true, open_time: '08:00', close_time: '17:00', available_on_request: false };
          }
        }
        return h;
      });
      setLocalHours(updated);
      onChange(updated);
    };

    const handleTimeChange = (dayValue: number, field: 'open_time' | 'close_time', value: string) => {
      // If in 24/7 mode, disabling it when changing time
      if (is24_7Mode) {
        setIs24_7Mode(false);
        if (on24_7Change) on24_7Change(false);
      }
      
      const updated = localHours.map(h => {
        if (h.day_of_week === dayValue) {
          return { ...h, [field]: value };
        }
        return h;
      });
      setLocalHours(updated);
      onChange(updated);
    };

    const handle24_7Change = (checked: boolean) => {
      setIs24_7Mode(checked);
      if (on24_7Change) on24_7Change(checked);
      
      if (checked) {
        // When enabling 24/7 mode, set all days to open 24 hours
        const updated = DAYS_OF_WEEK.map(day => ({
          day_of_week: day.value,
          is_open: true,
          open_time: '00:00',
          close_time: '23:59',
          available_on_request: false,
        }));
        setLocalHours(updated);
        onChange(updated);
      }
    };

    // Group days for better layout (Mon-Fri and Sat-Sun)
    const weekdays = localHours.filter(h => h.day_of_week >= 1 && h.day_of_week <= 5);
    const weekends = localHours.filter(h => h.day_of_week === 0 || h.day_of_week === 6);

  return (
    <div className="space-y-4">
      <div>
        {/*<h3 className="text-lg font-medium text-slate-500 mb-3">Business Hours</h3>*/}
        <p className="text-sm text-slate-500 mb-4">
          Set your weekly operating schedule. Customers will see when you're open.
        </p>
        
        {/* 24/7 Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={is24_7Mode}
                onChange={(e) => handle24_7Change(e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-blue-500 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-slate-500">
                Open 24/7
              </span>
            </label>
          </div>
          <span className="text-xs text-slate-500">
            When enabled, all days show as "Open 24 Hours"
          </span>
        </div>
      </div>

      {/* Weekdays */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-blue-500">Weekdays</h4>
{weekdays.map(day => {
      const dayInfo = DAYS_OF_WEEK.find(d => d.value === day.day_of_week);
      
      // If in 24/7 mode, show as open 24 hours
      if (is24_7Mode) {
        return (
          <div key={day.day_of_week} className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <div className="w-24 flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={true} // Always checked in 24/7 mode
                  onChange={() => handleToggleDay(day.day_of_week)}
                  disabled={disabled}
                  className="w-4 h-4 text-blue-500 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-slate-500">
                  {dayInfo?.shortLabel}
                </span>
              </label>
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <span className="text-blue-600 font-medium">Open 24 Hours</span>
            </div>
          </div>
        );
      }
      
      return (
        <div key={day.day_of_week} className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-lg">
          <div className="w-24 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={day.is_open}
                onChange={() => handleToggleDay(day.day_of_week)}
                disabled={disabled}
                className="w-4 h-4 text-blue-500 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-slate-500">
                {dayInfo?.shortLabel}
              </span>
            </label>
          </div>
          
          {day.is_open && (
            <div className="flex items-center gap-2 flex-1">
              <select
                value={day.open_time || ''}
                onChange={(e) => handleTimeChange(day.day_of_week, 'open_time', e.target.value)}
                disabled={disabled}
                aria-label={`${dayInfo?.shortLabel} opening time`}
                title="Opening time"
                className="text-sm bg-slate-900 text-slate-500 border-t border-slate-500 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Open</option>
                {TIME_OPTIONS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <span className="text-blue-500">to</span>
              <select
                value={day.close_time || ''}
                onChange={(e) => handleTimeChange(day.day_of_week, 'close_time', e.target.value)}
                disabled={disabled}
                aria-label={`${dayInfo?.shortLabel} closing time`}
                title="Closing time"
                className="text-sm bg-slate-900 text-slate-500 border-t border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Close</option>
                {TIME_OPTIONS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          )}
          
          {!day.is_open && (
            <span className="text-sm text-slate-400 italic">Closed</span>
          )}
        </div>
      );
    })}
      </div>

      {/* Weekends */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-blue-500">Weekend</h4>
{weekends.map(day => {
      const dayInfo = DAYS_OF_WEEK.find(d => d.value === day.day_of_week);
      const isSunday = day.day_of_week === 0;
      const isAvailableOnRequest = day.available_on_request && isSunday;
      
      // If in 24/7 mode, show as open 24 hours
      if (is24_7Mode) {
        return (
          <div key={day.day_of_week} className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <div className="w-24 flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={true} // Always checked in 24/7 mode
                  onChange={() => handleToggleDay(day.day_of_week)}
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-slate-700">
                  {dayInfo?.shortLabel}
                </span>
              </label>
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              {isSunday ? (
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={false} // Available on request is always false in 24/7 mode
                    onChange={(e) => {
                      // Prevent changing available on request in 24/7 mode
                      e.preventDefault();
                    }}
                    disabled={true}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-600">
                    Available on request
                  </span>
                </label>
              ) : (
                <>
                  <span className="text-blue-600 font-medium">Open 24 Hours</span>
                </>
              )}
            </div>
          </div>
        );
      }
      
      return (
        <div key={day.day_of_week} className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-lg">
          <div className="w-24 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={day.is_open}
                onChange={() => handleToggleDay(day.day_of_week)}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-slate-700">
                {dayInfo?.shortLabel}
              </span>
            </label>
          </div>
          
          {day.is_open && (
            <div className="flex items-center gap-2 flex-1">
              {isSunday ? (
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={day.available_on_request || false}
                    onChange={(e) => {
                      const updated = localHours.map(h => {
                        if (h.day_of_week === day.day_of_week) {
                          return {
                            ...h,
                            available_on_request: e.target.checked,
                            // Clear times when switching to "available on request"
                            open_time: e.target.checked ? null : h.open_time,
                            close_time: e.target.checked ? null : h.close_time
                          };
                        }
                        return h;
                      });
                      setLocalHours(updated);
                      onChange(updated);
                    }}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-600">
                    Available on request
                  </span>
                </label>
              ) : (
                <>
                  <select
                    value={day.open_time || ''}
                    onChange={(e) => handleTimeChange(day.day_of_week, 'open_time', e.target.value)}
                    disabled={disabled}
                    aria-label={`${dayInfo?.shortLabel} opening time`}
                    title="Opening time"
                    className="text-sm bg-slate-900 text-slate-500 border-t border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Open</option>
                    {TIME_OPTIONS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <span className="text-slate-400">to</span>
                  <select
                    value={day.close_time || ''}
                    onChange={(e) => handleTimeChange(day.day_of_week, 'close_time', e.target.value)}
                    disabled={disabled}
                    aria-label={`${dayInfo?.shortLabel} closing time`}
                    title="Closing time"
                    className="text-sm bg-slate-900 text-slate-500 border-t border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Close</option>
                    {TIME_OPTIONS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          )}
          
          {!day.is_open && (
            <span className="text-sm text-slate-400 italic">Closed</span>
          )}
        </div>
      );
    })}
      </div>
    </div>
  );
};

// Display-only component for showing business hours on public profile
interface BusinessHoursDisplayProps {
  hours: BusinessHours[];
}

export const BusinessHoursDisplay: React.FC<BusinessHoursDisplayProps> = ({ hours }) => {
    if (!hours || hours.length === 0) {
      return (
        <div className="text-sm text-slate-500 italic">
          Business hours not available
        </div>
      );
    }

    // Check if all days are closed
    const allClosed = hours.every(h => !h.is_open);
    if (allClosed) {
      return (
        <div className="text-sm text-slate-500 italic">
          Hours not set - Please contact us for availability
        </div>
      );
    }

    // Check if all days are open 24 hours (00:00 to 23:59)
    const allOpen24Hours = hours.every(h => 
      h.is_open && 
      h.open_time === '00:00' && 
      h.close_time === '23:59'
    );
    
    if (allOpen24Hours) {
      return (
        <div className="text-sm text-slate-800 font-medium">
          Open 24 Hours
        </div>
      );
    }

    // Group by open/closed status
    const openDays = hours.filter(h => h.is_open);
    
    if (openDays.length === 0) {
      return (
        <div className="text-sm text-slate-500 italic">
          Currently closed
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {hours.map(day => {
          const dayInfo = DAYS_OF_WEEK.find(d => d.value === day.day_of_week);
          const isSunday = day.day_of_week === 0;
          const isAvailableOnRequest = day.available_on_request && isSunday && day.is_open;

          if (!day.is_open) {
            return (
              <div key={day.day_of_week} className="flex justify-between text-sm">
                <span className="text-slate-600">{dayInfo?.label}</span>
                <span className="text-slate-400">Closed</span>
              </div>
            );
          }

          if (isAvailableOnRequest) {
            return (
              <div key={day.day_of_week} className="flex justify-between text-sm">
                <span className="text-slate-600">{dayInfo?.label}</span>
                <span className="text-slate-800 font-medium">Available on Request</span>
              </div>
            );
          }

          // Temporary workaround: if Sunday is open but has no times set, show "Available on Request"
          // This handles the case where available_on_request column doesn't exist yet
          if (isSunday && day.is_open && (!day.open_time || !day.close_time)) {
            return (
              <div key={day.day_of_week} className="flex justify-between text-sm">
                <span className="text-slate-600">{dayInfo?.label}</span>
                <span className="text-slate-800 font-medium">Available on Request</span>
              </div>
            );
          }

          const openTime = day.open_time ? day.open_time.slice(0, 5) : '';
          const closeTime = day.close_time ? day.close_time.slice(0, 5) : '';

          return (
            <div key={day.day_of_week} className="flex justify-between text-sm">
              <span className="text-slate-600">{dayInfo?.label}</span>
              <span className="text-slate-800 font-medium">
                {openTime} - {closeTime}
              </span>
            </div>
          );
        })}
      </div>
    );
  };
