//Web API created to retrieve and update data from server for Registration database table
//These REST APIs are called from angular js controller based on user requests
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using WebApplication4.Models;

namespace WebApplication4.Controllers
{
    public class RegistrationsController : ApiController
    {
        private KangarooRidesEntities db = new KangarooRidesEntities();

        // GET: api/Registrations
        public IQueryable<Registration> GetRegistrations()
        {
           // return db.Registrations;
            var selectAfter = DateTime.Now.AddYears(-2);
            var data = from record in db.Registrations
                       where record.Date >= selectAfter
                       && record.DeleteFlag != true
                       select record;
            return data;
        }

        // GET: api/Registrations/5
        [ResponseType(typeof(Registration))]
        public IHttpActionResult GetRegistration(int id)
        {
            Registration registration = db.Registrations.Find(id);
            if (registration == null)
            {
                return NotFound();
            }

            return Ok(registration);
        }

        // PUT: api/Registrations/record
        // [ResponseType(typeof(void))]
        public void PutRegistration(Registration registration)
        {
            Registration oldRecord = db.Registrations.Find(registration.Id);
            oldRecord.FirstName = registration.FirstName;
            oldRecord.Date = registration.Date;
            oldRecord.LastName = registration.LastName;
            oldRecord.Email = registration.Email;
            oldRecord.PhoneNumber = registration.PhoneNumber;
            oldRecord.Ride = registration.Ride;
            oldRecord.SpecialNeeds = registration.SpecialNeeds;
            oldRecord.Time = registration.Time;
            oldRecord.ChangedOn = DateTime.Now;
            oldRecord.DeleteFlag = registration.DeleteFlag;
            db.SaveChanges();
        }

        // POST: api/Registrations
        //[ResponseType(typeof(Registration))]
        public Registration PostRegistration(Registration registration)
        {
            registration.CreatedOn = DateTime.Now;
            registration.ChangedOn = DateTime.Now;
            db.Registrations.Add(registration);
            db.SaveChanges();
            return registration;
        }

        // DELETE: api/Registrations/5
        [ResponseType(typeof(Registration))]
        public IHttpActionResult DeleteRegistration(int id)
        {
            Registration registration = db.Registrations.Find(id);
            if (registration == null)
            {
                return NotFound();
            }

            db.Registrations.Remove(registration);
            db.SaveChanges();

            return Ok(registration);
        }
    }
}