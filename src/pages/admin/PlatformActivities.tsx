import { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Input, Select } from '@/components/ui';
import { Activity, Filter, Download, Search, Loader, AlertCircle } from 'lucide-react';
import activityLogService, { ActivityLog } from '@/services/activityLogService';

// Format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

export const PlatformActivities = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    filterActivitiesLocal();
  }, [activities, searchTerm, filterAction]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await activityLogService.getAllLogs();
      setActivities(data);
    } catch (err: any) {
      console.error('Error fetching activity logs:', err);
      setError('Failed to load activity logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterActivitiesLocal = () => {
    let filtered = [...activities];

    // Filter by action type
    if (filterAction !== 'all') {
      filtered = filtered.filter(activity => activity.action === filterAction);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.resource_type && activity.resource_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (activity.details && JSON.stringify(activity.details).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredActivities(filtered);
  };

  const getActivityColor = (action: string): 'primary' | 'success' | 'warning' | 'danger' | 'neutral' => {
    if (action.includes('create')) return 'success';
    if (action.includes('update') || action.includes('edit')) return 'warning';
    if (action.includes('delete') || action.includes('remove')) return 'danger';
    if (action.includes('login') || action.includes('logout')) return 'neutral';
    return 'primary';
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['ID', 'Action', 'Resource Type', 'Resource ID', 'User ID', 'IP Address', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredActivities.map(activity =>
        [
          activity.id,
          activity.action,
          activity.resource_type || '',
          activity.resource_id || '',
          activity.user || '',
          activity.ip_address || '',
          new Date(activity.created_at).toLocaleString()
        ].join(',')
      )
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get unique actions for filter dropdown
  const uniqueActions = Array.from(new Set(activities.map(a => a.action)));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Platform Activities</h1>
          <p className="text-neutral-600 mt-1">Monitor all system activities and events</p>
        </div>
        <Button 
          variant="outline" 
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExport}
          disabled={filteredActivities.length === 0}
        >
          Export Log
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent>
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
              <option value="all">All Activities</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </Select>
          </div>

          <div className="mb-4 text-sm text-neutral-600">
            Showing {filteredActivities.length} of {activities.length} activities
          </div>

          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">
                {activities.length === 0 
                  ? 'No activity logs found. Activities will appear here as users interact with the system.'
                  : 'No activities match your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 border-2 border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Badge variant={getActivityColor(activity.action)}>
                        {activity.action.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-sm text-neutral-500">
                        {formatTimeAgo(activity.created_at)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {activity.resource_type && (
                        <p className="text-sm text-secondary">
                          <span className="font-medium">Resource:</span> {activity.resource_type}
                          {activity.resource_id && ` (ID: ${activity.resource_id})`}
                        </p>
                      )}
                      {activity.user && (
                        <p className="text-sm text-neutral-600">
                          <span className="font-medium">User ID:</span> {activity.user}
                        </p>
                      )}
                      {activity.ip_address && (
                        <p className="text-sm text-neutral-600">
                          <span className="font-medium">IP:</span> {activity.ip_address}
                        </p>
                      )}
                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <details className="text-sm text-neutral-600 mt-2">
                          <summary className="cursor-pointer font-medium hover:text-primary-600">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-neutral-50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(activity.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
