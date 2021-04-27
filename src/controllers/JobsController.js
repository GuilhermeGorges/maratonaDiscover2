const Job = require('../model/Job')
const JobUtils = require('../utils/JobUtils')
const Profile = require('../model/Profile')

module.exports = {
  index(req, res) {

    const jobs = Job.get();
    const profile = Profile.get();

    const updatedJobs = jobs.map((job) => {
      // .map() pega cada item no estilo for each e retorna um item novo 
      // ajustes no job
      const remaining = JobUtils.remainingDays(job)
      const status = remaining <= 0 ? 'done' : 'progress'  //if ternário para retornar o status 
      return {
        ...job,
        remaining,
        status,
        budget: JobUtils.calculateBudget(job, profile["value-hour"])
      }
    })

    return res.render("index", { jobs: updatedJobs })
  },
  create(req, res) {
    return res.render("job")
  },
  save(req, res) {
    // estrutura do dado vindo do req.body => { name: 'asd', 'daily-hours': '0.4', 'total-hours': '3' }
    const jobs = Job.get();

    const lastId = jobs[jobs.length - 1]?.id || 0;

    jobs.push({
      id: lastId + 1,
      name: req.body.name,
      "daily-hours": req.body["daily-hours"],
      "total-hours": req.body["total-hours"],
      created_at: Date.now() // atribuindo data de hoje
    })
    return res.redirect('/')
  },
  show(req, res) {

    const jobId = req.params.id

    const job = Job.data.find(job => Number(job.id) === Number(jobId)) // find() faz a comparação entre os dois IDs e se for igual retorna o conteúdo daquele ID

    if (!job) {
      return res.send('JOB NOT FOUND!')
    }

    job.budget = Job.services.calculateBudget(job, Profile.data["value-hour"])

    return res.render("job-edit", { job })
  },
  update(req, res) {
    const jobId = req.params.id
    const job = Job.data.find(job => Number(job.id) === Number(jobId))
    if (!job) {
      return res.send('JOB NOT FOUND!')
    }

    const updatedJob = {
      ...job, //quando á mais itens precisamos espalhar o conteúdo
      name: req.body.name,
      "total-hours": req.body["total-hours"],
      "daily-hours": req.body["daily-hours"],
    }

    Job.data = Job.data.map(job => {
      if (Number(job.id) === Number(jobId)) {
        job = updatedJob
      }

      return job
    })
    res.redirect('/job/' + jobId)
  },
  delete(req, res) {
    const jobId = req.params.id

    Job.data = Job.data.filter(job => Number(job.id) !== Number(jobId)) // filter remove o tal situação acontecer (job.id ser igual jobId)

    return res.redirect('/')
  },
};