-- Seed 15 achievement badges into the achievements table.
-- Run AFTER sql/001-retention-features.sql which creates the achievements table.

INSERT INTO achievements (id, title, description, icon, rarity, category) VALUES
  -- Learning
  ('first_lesson',        'Hello, World!',          'Complete your first lesson',                 '🎯', 'common',    'learning'),
  ('five_lessons',        'Quick Learner',          'Complete 5 lessons',                         '📚', 'common',    'learning'),
  ('ten_lessons',         'Dedicated Student',      'Complete 10 lessons',                        '🎓', 'rare',      'learning'),
  ('first_path_complete', 'Path Completer',         'Complete all 25 lessons in one path',        '🏆', 'epic',      'learning'),
  ('daily_devotee',       'Daily Devotee',          'Complete 30 daily goals',                    '🎯', 'epic',      'learning'),
  -- Streak
  ('week_warrior',        'Week Warrior',           'Maintain a 7-day streak',                    '🔥', 'rare',      'streak'),
  ('fortnight_fighter',   'Fortnight Fighter',      'Maintain a 14-day streak',                   '⚡', 'rare',      'streak'),
  ('month_master',        'Month Master',           'Maintain a 30-day streak',                   '💎', 'epic',      'streak'),
  ('centurion',           'Centurion',              'Maintain a 100-day streak',                  '👑', 'legendary', 'streak'),
  -- Mastery
  ('ecs_master',          'ECS Architect',          'Complete Space Shooter path',                '🚀', 'epic',      'mastery'),
  ('fsm_master',          'State Machine Expert',   'Complete Platformer path',                   '🏃', 'epic',      'mastery'),
  ('oop_master',          'Data-Driven Designer',   'Complete Simple RPG path',                   '⚔️', 'epic',      'mastery'),
  ('robotics_master',     'Embedded Engineer',      'Complete Robotics path',                     '🤖', 'epic',      'mastery'),
  ('quadruple_threat',    'Paradigm Master',        'Complete all 4 paths',                       '🌟', 'legendary', 'mastery'),
  ('xp_legend',           'XP Legend',              'Earn 10,000 total XP',                       '💫', 'legendary', 'mastery')
ON CONFLICT (id) DO NOTHING;
