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
    public class RideInfoesController : ApiController
    {
        private KangarooRidesEntities db = new KangarooRidesEntities();

        // GET: api/RideInfoes
        public IQueryable<RideInfo> GetRideInfoes()
        {
           // return db.RideInfoes;
            var selectAfter = DateTime.Now.AddYears(-2);
            var data = from record in db.RideInfoes
                       where record.DeleteFlag != true
                       select record;
            return data;
        }

        // GET: api/RideInfoes/5
        [ResponseType(typeof(RideInfo))]
        public IHttpActionResult GetRideInfo(int id)
        {
            RideInfo rideInfo = db.RideInfoes.Find(id);
            if (rideInfo == null)
            {
                return NotFound();
            }

            return Ok(rideInfo);
        }

        // PUT: api/RideInfoes/record
        // [ResponseType(typeof(void))]
        public void PutRideInfo(RideInfo rideInfo)
        {
            RideInfo oldRecord = db.RideInfoes.Find(rideInfo.Id);
            oldRecord.RideName = rideInfo.RideName;
            oldRecord.ChangedOn = DateTime.Now;
            oldRecord.DeleteFlag = rideInfo.DeleteFlag;
            db.SaveChanges();
        }

        // POST: api/RideInfoes
        //[ResponseType(typeof(RideInfo))]
        public RideInfo PostRideInfo(RideInfo rideInfo)
        {
            rideInfo.CreatedOn = DateTime.Now;
            rideInfo.ChangedOn = DateTime.Now;
            db.RideInfoes.Add(rideInfo);
            db.SaveChanges();
            return rideInfo;
        }

        // DELETE: api/RideInfoes/5
        [ResponseType(typeof(RideInfo))]
        public IHttpActionResult DeleteRideInfo(int id)
        {
            RideInfo rideInfo = db.RideInfoes.Find(id);
            if (rideInfo == null)
            {
                return NotFound();
            }

            db.RideInfoes.Remove(rideInfo);
            db.SaveChanges();

            return Ok(rideInfo);
        }

        /*protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }*/

        /*private bool rideInfoExists(int id)
        {
            return db.RideInfoes.Count(e => e.Id == id) > 0;
        }*/
    }
}