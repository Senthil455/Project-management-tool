import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Project from './models/Project.js';
import Issue from './models/Issue.js';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB. Clearing old data...');

  await Promise.all([
    Issue.deleteMany({}),
    Project.deleteMany({}),
    User.deleteMany({}),
  ]);

  console.log('Creating users...');
  const [john, sarah, mike, anna] = await User.create([
    { name: 'John Carter', email: 'john@demo.com', password: 'password123', avatarColor: '#0052CC' },
    { name: 'Sarah Kim', email: 'sarah@demo.com', password: 'password123', avatarColor: '#36B37E' },
    { name: 'Mike Torres', email: 'mike@demo.com', password: 'password123', avatarColor: '#FF8B00' },
    { name: 'Anna Patel', email: 'anna@demo.com', password: 'password123', avatarColor: '#6554C0' },
  ]);

  console.log('Creating projects...');
  const web = await Project.create({
    name: 'Website Redesign',
    key: 'WEB',
    description: 'Redesigning the company website with a modern look and improved UX.',
    lead: john._id,
    members: [
      { user: sarah._id, role: 'admin' },
      { user: mike._id, role: 'member' },
      { user: anna._id, role: 'viewer' },
    ],
  });
  const mob = await Project.create({
    name: 'Mobile App Development',
    key: 'MOB',
    description: 'Building the next generation mobile app for iOS and Android.',
    lead: sarah._id,
    members: [
      { user: john._id, role: 'admin' },
      { user: mike._id, role: 'member' },
      { user: anna._id, role: 'member' },
    ],
  });
  const mkt = await Project.create({
    name: 'Marketing Campaign',
    key: 'MKT',
    description: 'Q3 marketing campaign planning and execution.',
    lead: anna._id,
    members: [
      { user: john._id, role: 'member' },
      { user: sarah._id, role: 'viewer' },
    ],
  });

  const mkIssue = async (project, number, data) => {
    const key = `${project.key}-${number}`;
    return Issue.create({
      project: project._id,
      key,
      reporter: data.reporter,
      order: number,
      ...data,
    });
  };

  console.log('Creating issues...');
  const created = [];

  created.push(await mkIssue(web, 1, {
    title: 'Redesign homepage hero section',
    description: 'Create a new hero section with the updated brand identity, including headline, subtext and CTA buttons.',
    type: 'story',
    status: 'done',
    priority: 'high',
    assignee: sarah._id,
    reporter: john._id,
    storyPoints: 5,
    labels: ['design', 'frontend'],
    activity: [
      { user: john._id, action: 'created' },
      { user: sarah._id, action: 'updated', field: 'status', oldValue: 'todo', newValue: 'done' },
    ],
  }));

  created.push(await mkIssue(web, 2, {
    title: 'Fix navigation menu on mobile',
    description: 'The hamburger menu is not collapsing correctly on small screens. Need to fix the responsive behavior.',
    type: 'bug',
    status: 'inprogress',
    priority: 'highest',
    assignee: mike._id,
    reporter: sarah._id,
    storyPoints: 3,
    labels: ['frontend', 'bug'],
    activity: [
      { user: sarah._id, action: 'created' },
      { user: mike._id, action: 'updated', field: 'status', oldValue: 'todo', newValue: 'inprogress' },
    ],
  }));

  created.push(await mkIssue(web, 3, {
    title: 'Implement contact form with validation',
    description: 'Build a contact form with client-side and server-side validation, captcha and success state.',
    type: 'task',
    status: 'todo',
    priority: 'medium',
    assignee: sarah._id,
    reporter: john._id,
    storyPoints: 3,
    labels: ['frontend', 'forms'],
  }));

  created.push(await mkIssue(web, 4, {
    title: 'Write copy for About page',
    description: 'Draft the new about page copy based on the brand tone guidelines.',
    type: 'task',
    status: 'todo',
    priority: 'low',
    assignee: anna._id,
    reporter: john._id,
    storyPoints: 2,
    labels: ['content'],
  }));

  created.push(await mkIssue(web, 5, {
    title: 'Migrate to new CMS',
