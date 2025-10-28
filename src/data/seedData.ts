import type { Job, Candidate, Assessment, AssessmentQuestion } from '../types';

const jobTitles = [
  'Senior Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'DevOps Engineer',
  'QA Engineer',
  'Product Manager',
  'UI/UX Designer',
  'Data Analyst',
  'Machine Learning Engineer',
  'Security Engineer',
  'Mobile Developer',
  'Full Stack Developer',
  'Cloud Architect',
  'Tech Lead',
  'Software Architect',
  'Database Administrator',
  'Scrum Master',
  'Business Analyst',
  'Project Manager',
  'Systems Engineer',
  'Network Engineer',
  'Site Reliability Engineer',
  'Research Engineer',
  'AI Engineer',
  'Blockchain Developer'
];

const firstNames = [
  'John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Jessica',
  'Robert', 'Ashley', 'William', 'Amanda', 'Richard', 'Melissa', 'Joseph',
  'Michelle', 'Christopher', 'Nicole', 'Daniel', 'Stephanie', 'Matthew',
  'Jennifer', 'Anthony', 'Lisa', 'Mark', 'Maria', 'Donald', 'Nancy',
  'Steven', 'Betty', 'Andrew', 'Sandra', 'Joshua', 'Donna', 'Kenneth',
  'Carol', 'Kevin', 'Ruth', 'Brian', 'Sharon', 'George', 'Michelle',
  'Edward', 'Laura', 'Ronald', 'Kimberly', 'Timothy', 'Deborah'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green'
];

const emailDomains = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'company.com',
  'tech.io', 'startup.com', 'business.com', 'work.com'
];

const jobTags = [
  'Remote', 'Full-time', 'Contract', 'Hybrid', 'Senior', 'Junior',
  'Frontend', 'Backend', 'Fullstack', 'React', 'Node.js', 'Python',
  'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'JavaScript', 'Agile'
];

const skills = [
  'React', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript',
  'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Redis',
  'GraphQL', 'REST APIs', 'Git', 'CI/CD', 'Agile', 'Scrum'
];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomMultiple<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function randomName(): string {
  return `${randomItem(firstNames)} ${randomItem(lastNames)}`;
}

function randomEmail(name: string): string {
  const sanitized = name.toLowerCase().replace(/\s+/g, '.');
  return `${sanitized}@${randomItem(emailDomains)}`;
}

function randomPhone(): string {
  const area = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `(${area}) ${exchange}-${number}`;
}

export function generateJobs(): Job[] {
  const jobs: Job[] = [];
  
  for (let i = 0; i < 25; i++) {
    const title = randomItem(jobTitles);
    const status = i < 20 ? 'active' : 'archived'; // 20 active, 5 archived
    const tags = randomMultiple(jobTags, Math.floor(Math.random() * 4) + 1);
    const minSalary = Math.floor(Math.random() * 50000) + 50000;
    const maxSalary = minSalary + Math.floor(Math.random() * 50000);

    jobs.push({
      id: generateId(),
      title,
      slug: generateSlug(title),
      status,
      tags,
      order: i,
      description: `We are looking for a talented ${title} to join our team. This is an exciting opportunity to work on cutting-edge projects and make a real impact.`,
      requirements: [
        '3+ years of experience',
        'Strong problem-solving skills',
        'Excellent communication abilities',
        'Bachelor\'s degree or equivalent'
      ],
      location: `${randomItem(['New York', 'San Francisco', 'Austin', 'Seattle', 'Chicago', 'Boston'])} (${randomItem(['Remote', 'Hybrid', 'On-site'])})`,
      salary: {
        min: minSalary,
        max: maxSalary,
        currency: 'USD'
      },
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return jobs;
}

export function generateCandidates(jobs: Job[]): Candidate[] {
  const candidates: Candidate[] = [];
  const stages: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
  
  // Track order for each stage
  const stageOrders: Record<string, number> = {};
  
  for (let i = 0; i < 1000; i++) {
    const name = randomName();
    const jobId = randomItem(jobs).id;
    const stage = randomItem(stages);

    // Initialize order for this stage if not exists
    if (!stageOrders[stage]) {
      stageOrders[stage] = 0;
    }

    candidates.push({
      id: generateId(),
      name,
      email: randomEmail(name),
      phone: randomPhone(),
      stage,
      jobId,
      appliedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      skills: randomMultiple(skills, Math.floor(Math.random() * 5) + 1),
      experience: Math.floor(Math.random() * 10) + 1,
      resume: `https://example.com/resumes/${generateId()}.pdf`,
      order: stageOrders[stage]++
    });
  }

  return candidates;
}

function generateAssessmentQuestions(): AssessmentQuestion[] {
  const questions: AssessmentQuestion[] = [];
  questions.push({
    id: 'q1',
    type: 'single_choice',
    title: 'How many years of professional experience do you have?',
    required: true,
    order: 1,
    options: ['0-2 years', '3-5 years', '6-10 years', '10+ years']
  });
  questions.push({
    id: 'q2',
    type: 'multi_choice',
    title: 'Which technologies are you familiar with? (Select all that apply)',
    required: true,
    order: 2,
    options: ['React', 'Node.js', 'Python', 'Java', 'Docker', 'Kubernetes']
  });
  questions.push({
    id: 'q3',
    type: 'short_text',
    title: 'What is your preferred development environment?',
    required: true,
    order: 3,
    validation: { maxLength: 50 }
  });
  questions.push({
    id: 'q4',
    type: 'long_text',
    title: 'Describe a challenging project you worked on and how you solved it.',
    required: true,
    order: 4,
    validation: { maxLength: 1000 }
  });
  questions.push({
    id: 'q5',
    type: 'numeric',
    title: 'How many GitHub repositories do you have?',
    required: false,
    order: 5,
    validation: { min: 0, max: 1000 }
  });
  questions.push({
    id: 'q6',
    type: 'single_choice',
    title: 'Are you willing to relocate?',
    required: true,
    order: 6,
    options: ['Yes', 'No', 'Maybe']
  });
  questions.push({
    id: 'q7',
    type: 'short_text',
    title: 'Which cities would you be willing to relocate to?',
    required: false,
    order: 7,
    conditional: {
      dependsOn: 'q6',
      condition: 'Yes'
    },
    validation: { maxLength: 100 }
  });
  questions.push({
    id: 'q8',
    type: 'file_upload',
    title: 'Upload your portfolio or sample work',
    required: false,
    order: 8
  });
  questions.push({
    id: 'q9',
    type: 'multi_choice',
    title: 'Which CI/CD tools have you used?',
    required: false,
    order: 9,
    options: ['Jenkins', 'GitLab CI', 'CircleCI', 'Travis CI', 'GitHub Actions', 'Azure DevOps']
  });
  questions.push({
    id: 'q10',
    type: 'long_text',
    title: 'Explain your approach to designing a scalable system architecture.',
    required: true,
    order: 10,
    validation: { maxLength: 2000 }
  });

  return questions;
}

export function generateAssessments(jobs: Job[]): Assessment[] {
  const assessments: Assessment[] = [];
  const jobsWithAssessments = jobs.slice(0, 3);
  
  jobsWithAssessments.forEach((job) => {
    assessments.push({
      id: generateId(),
      jobId: job.id,
      title: `${job.title} Assessment`,
      description: `Technical assessment for ${job.title}`,
      sections: [
        {
          id: 's1',
          title: 'Technical Skills',
          description: 'Questions about your technical background',
          questions: generateAssessmentQuestions().slice(0, 5),
          order: 1
        },
        {
          id: 's2',
          title: 'Experience & Portfolio',
          description: 'Questions about your experience',
          questions: generateAssessmentQuestions().slice(5, 10),
          order: 2
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  return assessments;
}

export async function seedDatabase(): Promise<{
  jobs: number;
  candidates: number;
  assessments: number;
}> {
  const jobs = generateJobs();
  const candidates = generateCandidates(jobs);
  const assessments = generateAssessments(jobs);

  const { db } = await import('../db/schema');

  await db.jobs.bulkAdd(jobs);

  const batchSize = 100;
  for (let i = 0; i < candidates.length; i += batchSize) {
    await db.candidates.bulkAdd(candidates.slice(i, i + batchSize));
  }

  await db.assessments.bulkAdd(assessments);

  return {
    jobs: jobs.length,
    candidates: candidates.length,
    assessments: assessments.length
  };
}
