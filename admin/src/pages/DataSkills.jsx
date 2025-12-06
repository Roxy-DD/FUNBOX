import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Search, Filter, Award, BookOpen, Database, Wrench, Code } from 'lucide-react';

export default function DataSkills() {
  const { lang } = useLanguage();
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  // Fetch skills data
  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data/skills');
      const data = await response.json();
      
      if (data.success) {
        setSkills(data.data);
        setFilteredSkills(data.data);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      alert('Failed to load skills data');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...skills];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(s => s.category === categoryFilter);
    }

    // Level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(s => s.level === levelFilter);
    }

    setFilteredSkills(filtered);
  }, [searchTerm, categoryFilter, levelFilter, skills]);

  const getLevelBadge = (level) => {
    const styles = {
      beginner: 'bg-gray-100 text-gray-700',
      intermediate: 'bg-blue-100 text-blue-700',
      advanced: 'bg-purple-100 text-purple-700',
      expert: 'bg-green-100 text-green-700'
    };
    const labels = {
      beginner: lang === 'zh' ? '初级' : 'Beginner',
      intermediate: lang === 'zh' ? '中级' : 'Intermediate',
      advanced: lang === 'zh' ? '高级' : 'Advanced',
      expert: lang === 'zh' ? '专家' : 'Expert'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[level]}`}>
        {labels[level]}
      </span>
    );
  };

  const getCategoryLabel = (category) => {
    const labels = {
      frontend: lang === 'zh' ? '前端' : 'Frontend',
      backend: lang === 'zh' ? '后端' : 'Backend',
      database: lang === 'zh' ? '数据库' : 'Database',
      tools: lang === 'zh' ? '工具' : 'Tools',
      other: lang === 'zh' ? '其他' : 'Other'
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      frontend: <Code size={16} />,
      backend: <BookOpen size={16} />,
      database: <Database size={16} />,
      tools: <Wrench size={16} />,
      other: <Filter size={16} />
    };
    return icons[category] || icons.other;
  };

  // Group skills by category
  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading skills...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {lang === 'zh' ? '技能管理' : 'Skills Management'}
        </h1>
        <p className="text-gray-600 text-sm">
          {lang === 'zh' ? '查看和管理所有技能数据' : 'View and manage all skills data'}
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
              placeholder={lang === 'zh' ? '搜索技能...' : 'Search skills...'}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">{lang === 'zh' ? '所有分类' : 'All Categories'}</option>
            <option value="frontend">{lang === 'zh' ? '前端' : 'Frontend'}</option>
            <option value="backend">{lang === 'zh' ? '后端' : 'Backend'}</option>
            <option value="database">{lang === 'zh' ? '数据库' : 'Database'}</option>
            <option value="tools">{lang === 'zh' ? '工具' : 'Tools'}</option>
            <option value="other">{lang === 'zh' ? '其他' : 'Other'}</option>
          </select>

          {/* Level Filter */}
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="all">{lang === 'zh' ? '所有水平' : 'All Levels'}</option>
            <option value="beginner">{lang === 'zh' ? '初级' : 'Beginner'}</option>
            <option value="intermediate">{lang === 'zh' ? '中级' : 'Intermediate'}</option>
            <option value="advanced">{lang === 'zh' ? '高级' : 'Advanced'}</option>
            <option value="expert">{lang === 'zh' ? '专家' : 'Expert'}</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">{lang === 'zh' ? '总技能数' : 'Total Skills'}</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{skills.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">{lang === 'zh' ? '初级' : 'Beginner'}</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">
            {skills.filter(s => s.level === 'beginner').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">{lang === 'zh' ? '中级' : 'Intermediate'}</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {skills.filter(s => s.level === 'intermediate').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">{lang === 'zh' ? '高级' : 'Advanced'}</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {skills.filter(s => s.level === 'advanced').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">{lang === 'zh' ? '专家' : 'Expert'}</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {skills.filter(s => s.level === 'expert').length}
          </div>
        </div>
      </div>

      {/* Skills by Category */}
      <div className="space-y-6">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              {getCategoryIcon(category)}
              <h2 className="text-lg font-semibold text-gray-800">
                {getCategoryLabel(category)} ({categorySkills.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorySkills.map(skill => (
                <div key={skill.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-800">{skill.name}</h3>
                    </div>
                    {getLevelBadge(skill.level)}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{skill.description}</p>

                  {/* Experience */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Award size={14} />
                    <span>
                      {skill.experience.years > 0 && `${skill.experience.years}${lang === 'zh' ? '年' : 'y'} `}
                      {skill.experience.months > 0 && `${skill.experience.months}${lang === 'zh' ? '月' : 'm'}`}
                      {lang === 'zh' ? ' 经验' : ' experience'}
                    </span>
                  </div>

                  {/* Projects (if any) */}
                  {skill.projects && skill.projects.length > 0 && (
                    <div className="text-xs text-gray-500">
                      {lang === 'zh' ? '相关项目: ' : 'Projects: '}
                      {skill.projects.slice(0, 2).join(', ')}
                      {skill.projects.length > 2 && ` +${skill.projects.length - 2}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSkills.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {lang === 'zh' ? '没有找到匹配的技能' : 'No skills found'}
          </p>
        </div>
      )}
    </div>
  );
}
