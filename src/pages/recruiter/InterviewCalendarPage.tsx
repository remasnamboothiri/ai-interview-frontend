import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

const mockInterviews = [
  { id: '1', date: new Date('2024-12-23'), candidate: 'John Doe', job: 'Senior Engineer', time: '10:00 AM', status: 'scheduled' },
  { id: '2', date: new Date('2024-12-24'), candidate: 'Sarah Wilson', job: 'Product Manager', time: '2:00 PM', status: 'scheduled' },
  { id: '3', date: new Date('2024-12-26'), candidate: 'Mike Johnson', job: 'UX Designer', time: '11:00 AM', status: 'scheduled' },
];

export const InterviewCalendarPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getInterviewsForDate = (date: Date) => {
    return mockInterviews.filter(
      interview => format(interview.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Interview Calendar</h1>
          <p className="text-neutral-600 mt-1">View and manage your interview schedule</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/interviews/schedule')}>
          Schedule Interview
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-secondary">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-neutral-600 py-2">
                {day}
              </div>
            ))}

            {Array.from({ length: monthStart.getDay() }).map((_, idx) => (
              <div key={`empty-${idx}`} className="p-2" />
            ))}

            {daysInMonth.map((date) => {
              const interviews = getInterviewsForDate(date);
              const isCurrentDay = isToday(date);

              return (
                <div
                  key={date.toISOString()}
                  className={`min-h-24 p-2 border-2 rounded-lg ${
                    isCurrentDay ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${
                    isCurrentDay ? 'text-primary-600' : 'text-neutral-600'
                  }`}>
                    {format(date, 'd')}
                  </div>
                  <div className="space-y-1">
                    {interviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="text-xs p-1 bg-primary-100 rounded cursor-pointer hover:bg-primary-200 transition-colors"
                        onClick={() => navigate(`/interviews/${interview.id}`)}
                      >
                        <p className="font-semibold text-primary-900 truncate">
                          {interview.time}
                        </p>
                        <p className="text-primary-700 truncate">{interview.candidate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-secondary mb-4">Upcoming Interviews</h3>
          <div className="space-y-3">
            {mockInterviews.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center justify-between p-4 border-2 border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/interviews/${interview.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-secondary">{interview.candidate}</p>
                    <p className="text-sm text-neutral-600">{interview.job}</p>
                    <p className="text-sm text-neutral-500">
                      {format(interview.date, 'MMM dd, yyyy')} • {interview.time}
                    </p>
                  </div>
                </div>
                <Badge variant="warning">{interview.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
