import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Search, Calendar, MapPin, Building, Award, ExternalLink, Trophy } from 'lucide-react';

export default function DataTimeline() {
  const { lang } = useLanguage();
  const [timeline, setTimeline] = useState([]);
  const [filteredTimeline, setFilteredTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // desc = newest first

  // Fetch timeline data
  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data/timeline');
      const data = await response.json();
      
      if (data.success) {
        setTimeline(data.data);
        setFilteredTimeline(data.data);
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
      alert('Failed to load timeline data');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...timeline];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.organization && item.organization.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredTimeline(filtered);
  }, [searchTerm, typeFilter, sortOrder, timeline]);

  const getTypeBadge = (type) => {
    const styles = {
      education: 'bg-blue-100 text-blue-700',
      work: 'bg-green-100 text-green-700',
      project: 'bg-purple-100 text-purple-700',
      achievement: 'bg-yellow-100 text-yellow-700'
    };
    const labels = {
      education: lang === 'zh' ? '教育' : 'Education',
      work: lang === 'zh' ? '工作' : 'Work',
      project: lang === 'zh' ? '项目' : 'Project',
      achievement: lang === 'zh' ? '成就' : 'Achievement'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      education: <Award size={20} className="text-blue-600" />,
      work: <Building size={20} className="text-green-600" />,
      project: <Calendar size={20} className="text-purple-600" />,
      achievement: <Trophy size={20} className="text-yellow-600" />
    };
    return icons[type] || icons.achievement;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return lang === 'zh' ? '至今' : 'Present';
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0 && remainingMonths > 0) {
      return `${years}${lang === 'zh' ? '年' : 'y'} ${remainingMonths}${lang === 'zh' ? '月' : 'm'}`;
    } else if (years > 0) {
      return `${years}${lang === 'zh' ? '年' : 'y'}`;
    } else {
      return `${remainingMonths}${lang === 'zh' ? '月' : 'm'}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {lang === 'zh' ? '时间线管理' : 'Timeline Management'}
        </h1>
        <p className="text-gray-600 text-sm">
          {lang === 'zh' ? '查看和管理个人成长历程' : 'View and manage personal growth journey'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={lang === 'zh' ? '搜索事件...' : 'Search events...'}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">{lang === 'zh' ? '所有类型' : 'All Types'}</option>
            <option value="education">{lang === 'zh' ? '教育' : 'Education'}</option>
            <option value="work">{lang === 'zh' ? '工作' : 'Work'}</option>
            <option value="project">{lang === 'zh' ? '项目' : 'Project'}</option>
            <option value="achievement">{lang === 'zh' ? '成就' : 'Achievement'}</option>
          </select>

          {/* Sort Order */}
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">{lang === 'zh' ? '最新优先' : 'Newest First'}</option>
            <option value="asc">{lang === 'zh' ? '最早优先' : 'Oldest First'}</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">{lang === 'zh' ? '总事件数' : 'Total Events'}</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{timeline.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">{lang === 'zh' ? '教育' : 'Education'}</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {timeline.filter(t => t.type === 'education').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">{lang === 'zh' ? '工作' : 'Work'}</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {timeline.filter(t => t.type === 'work').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">{lang === 'zh' ? '项目' : 'Projects'}</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {timeline.filter(t => t.type === 'project').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">{lang === 'zh' ? '成就' : 'Achievements'}</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {timeline.filter(t => t.type === 'achievement').length}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Timeline items */}
        <div className="space-y-6">
          {filteredTimeline.map((item, index) => (
            <div key={item.id} className="relative flex gap-6">
              {/* Icon */}
              <div className="flex-shrink-0 w-16 flex items-start justify-center pt-1">
                <div className="w-12 h-12 rounded-full bg-white border-4 border-gray-200 flex items-center justify-center z-10">
                  {getTypeIcon(item.type)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 mb-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h3>
                    {item.organization && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Building size={14} />
                        <span>{item.organization}</span>
                      </div>
                    )}
                    {item.position && (
                      <div className="text-sm text-gray-600 mb-1">{item.position}</div>
                    )}
                  </div>
                  {getTypeBadge(item.type)}
                </div>

                {/* Date and Location */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(item.startDate)} - {formatDate(item.endDate)}</span>
                    <span className="text-xs text-gray-400">({calculateDuration(item.startDate, item.endDate)})</span>
                  </div>
                  {item.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>

                {/* Skills */}
                {item.skills && item.skills.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">{lang === 'zh' ? '技能:' : 'Skills:'}</div>
                    <div className="flex flex-wrap gap-1">
                      {item.skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {item.achievements && item.achievements.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">{lang === 'zh' ? '成就:' : 'Achievements:'}</div>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {item.achievements.map((achievement, idx) => (
                        <li key={idx}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Links */}
                {item.links && item.links.length > 0 && (
                  <div className="flex gap-3 mt-3">
                    {item.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink size={12} />
                        {link.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredTimeline.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {lang === 'zh' ? '没有找到匹配的事件' : 'No events found'}
          </p>
        </div>
      )}
    </div>
  );
}
