require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const TeamMember = require('./models/TeamMember');
const Job = require('./models/Job');

const projectsData = [
  { title: "Ultimate Motors – G+6 Office Building", location: "Ethiopia, Hawassa", year: "2013 E.C", category: "commercial", description: "Showroom and office headquarters for a leading automotive dealership.", imageurl: "assets/front/ultimate.jpg", featured: "yes", order: 1 },
  { title: "B+G+6+T Commercial (Mekane Yesus)", location: "Hawassa, Ethiopia", year: "", category: "commercial", description: "A B+G+6+Terrace commercial building for the Ethiopian Evangelical Church Mekane Yesus.", imageurl: "assets/front/g6.jpg", featured: "yes", order: 2 },
  { title: "B+G+10 Commercial", location: "Hawassa, Ethiopia", year: "2015 E.C", category: "commercial", description: "A ten-story commercial high-rise for private clients Ato Tewodros Iran & Biruktawit Goyta.", imageurl: "assets/front/hawasa-g10.jpg", featured: "yes", order: 3 },
  { title: "B+G+M+8 Magelas Hotel & Resort", location: "Ethiopia, Hawassa", year: "2013 E.C", category: "commercial", description: "A full-service hotel and resort with landscaped courtyards and resort-grade amenities.", imageurl: "assets/front/megalis.jpg", featured: "yes", order: 4 },
  { title: "G+2 Residence Building", location: "Ethiopia, Hawassa", year: "", category: "residential", description: "A private two-story family residence with generous outdoor living space.", imageurl: "assets/front/menoria.jpg", featured: "yes", order: 5 },
  { title: "B+G+6 Hotel", location: "Ethiopia, Hawassa", year: "", category: "commercial", description: "A boutique hotel building for Dr. Gezhage Bekele.", imageurl: "assets/front/ngd.jpg", featured: "yes", order: 6 },
  { title: "Zebra Green Hotel Building – G+4 & G+2", location: "Hawassa, Ethiopia", year: "2015 E.C", category: "commercial", description: "A two-block hotel development combining a G+4 tower with a G+2 annex.", imageurl: "assets/projects/commercial-zebragreen.jpg", featured: "no", order: 7 },
  { title: "B+G+7 Commercial Building", location: "Hawassa, Ethiopia", year: "2014 E.C", category: "commercial", description: "A seven-story mixed commercial building for private client Ato Mekoyet Tsegaye.", imageurl: "assets/projects/commercial-bg7.jpg", featured: "no", order: 8 },
  { title: "Ethiopian Teachers Association HQ – 2B+G+32", location: "Addis Ababa, Ethiopia", year: "2010 E.C", category: "commercial", description: "Our flagship high-rise: a 32-story mixed-use tower and HQ for the Ethiopian Teachers Association.", imageurl: "assets/projects/commercial-teachers-tower.jpg", featured: "no", order: 9 },
  { title: "Ethiopian Red Cross Association Building – B+G+6", location: "Jinka, Ethiopia", year: "2012 E.C", category: "public", description: "A mixed-use civic building for the Ethiopian Red Cross Association.", imageurl: "assets/projects/civic-redcross.jpg", featured: "no", order: 10 },
  { title: "Marsil Youth Center", location: "Sodo, Ethiopia", year: "2013 E.C", category: "public", description: "A landmark youth center master plan with a sculptural gateway arch.", imageurl: "assets/projects/civic-youthcenter.jpg", featured: "no", order: 11 },
  { title: "Worship Hall & Office – G+1 & G+4", location: "Hawassa, Ethiopia", year: "2012 E.C", category: "public", description: "A worship hall and office building for the Addis Ketema Full Gospel Believers Church.", imageurl: "assets/projects/civic-worshiphall.jpg", featured: "no", order: 12 },
  { title: "B+G+5 Mixed-Use Building", location: "Hawassa, Ethiopia", year: "", category: "residential", description: "A five-story mixed-use residential and retail building for Ato Hailu Haro.", imageurl: "assets/front/foq.jpg", featured: "no", order: 13 },
  { title: "G+2+T Residence Building", location: "Hawassa, Ethiopia", year: "2015 E.C", category: "residential", description: "A private villa with rooftop terrace and stone-clad chimney feature.", imageurl: "assets/projects/residential-villa-g2t.jpg", featured: "no", order: 14 },
  { title: "G+1 Residence Building", location: "Hawassa, Ethiopia", year: "2013 E.C", category: "residential", description: "A compact single-story-plus residence with a bold façade and integrated garage.", imageurl: "assets/projects/residential-g1.jpg", featured: "no", order: 15 }
];

const teamData = [
  { name: "Alemu Tamiru", position: "Team Leader", department: "Architecture", profession: "Practicing Architect", yearsexperience: "18 years", photo: "", order: 1 },
  { name: "Zekariyas Tesfaye", position: "Architect", department: "Architecture", profession: "Practicing Architect", yearsexperience: "5 years", photo: "", order: 2 },
  { name: "Yosef Fatahun", position: "Architect", department: "Architecture", profession: "Practicing Architect", yearsexperience: "5 years", photo: "", order: 3 },
  { name: "Biruk Girma", position: "Architect", department: "Architecture", profession: "Practicing Architect", yearsexperience: "4 years", photo: "", order: 4 },
  { name: "Efrem Eyasu", position: "Architect", department: "Architecture", profession: "Graduate Architect", yearsexperience: "2 years", photo: "", order: 5 },
  { name: "Melekamsew Teshome", position: "Architect", department: "Architecture", profession: "Graduate Architect", yearsexperience: "3 years", photo: "", order: 6 },
  { name: "Ali Hussen", position: "Head, Structural Engineering", department: "Structural Engineering", profession: "Professional Structural Engineer", yearsexperience: "7 years", photo: "", order: 7 },
  { name: "Mihiretu Tefera", position: "Lead Structural Engineer", department: "Structural Engineering", profession: "Professional Structural Engineer", yearsexperience: "5 years", photo: "", order: 8 },
  { name: "Eden Birara", position: "Structural Engineer", department: "Structural Engineering", profession: "Graduate Engineer", yearsexperience: "2 years", photo: "", order: 9 },
  { name: "Eskedar Masresha", position: "Head, Electrical Engineering", department: "Electrical Engineering", profession: "Professional Electrical Engineer", yearsexperience: "10 years", photo: "", order: 10 },
  { name: "Soloma Ashenafi", position: "Electrical Engineer", department: "Electrical Engineering", profession: "Professional Electrical Engineer", yearsexperience: "8 years", photo: "", order: 11 },
  { name: "Lema Teferi", position: "Head, Sanitary Engineering", department: "Sanitary & Geotechnical", profession: "Professional Sanitary Engineer", yearsexperience: "10 years", photo: "", order: 12 },
  { name: "Danial Haylemariam", position: "Soil Investigation", department: "Sanitary & Geotechnical", profession: "Professional Geotechnical Engineer", yearsexperience: "10 years", photo: "", order: 13 },
  { name: "Abel Alemu", position: "Quantity Surveyor", department: "Contract Administration & CAD", profession: "Construction Technology Management", yearsexperience: "3 years", photo: "", order: 14 },
  { name: "Esrael Mulugeta", position: "AutoCAD Technician", department: "Contract Administration & CAD", profession: "Construction Technology Management", yearsexperience: "2 years", photo: "", order: 15 }
];

const jobsData = [
  { title: "Junior Architect", department: "Architecture", location: "Hawassa, Ethiopia", type: "Full-time", description: "We're looking for a junior architect with 1-3 years of experience in residential and commercial design to join our Hawassa studio.", deadline: "31-Dec-2026", isActive: true, order: 1 },
  { title: "Structural Engineer", department: "Structural Engineering", location: "Hawassa, Ethiopia", type: "Full-time", description: "Experienced structural engineer needed for high-rise and mixed-use project design and site supervision.", deadline: "31-Dec-2026", isActive: true, order: 2 },
  { title: "Senior Architect & Project Lead", department: "Architecture & Urban Planning", location: "Hawassa / Addis Ababa, Ethiopia", type: "Full-time", description: "We are seeking an experienced Senior Architect to lead major commercial and mixed-use projects from conceptual design through construction supervision. The candidate will collaborate with multidisciplinary engineering teams, coordinate with clients, and champion architectural excellence.", deadline: "31-Dec-2026", isActive: true, order: 3 }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const pCount = await Project.countDocuments();
  if (pCount === 0) {
    await Project.insertMany(projectsData);
    console.log(`Seeded ${projectsData.length} projects.`);
  } else {
    console.log(`Projects already exist (${pCount} found).`);
  }

  const tCount = await TeamMember.countDocuments();
  if (tCount === 0) {
    await TeamMember.insertMany(teamData);
    console.log(`Seeded ${teamData.length} team members.`);
  } else {
    console.log(`Team members already exist (${tCount} found).`);
  }

  const jCount = await Job.countDocuments();
  if (jCount === 0) {
    await Job.insertMany(jobsData);
    console.log(`Seeded ${jobsData.length} jobs.`);
  } else {
    console.log(`Jobs already exist (${jCount} found).`);
  }

  await mongoose.disconnect();
  console.log('Seeding finished.');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
