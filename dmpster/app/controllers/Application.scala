package controllers

import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import play.api.libs.json.Json._
import models.Dump
import scala.io.Source
import play.api.libs.concurrent._
import play.api.Play.current
import utils.DmpParser
import play.Logger
import models.Tag
import models.Bucket

object Application extends Controller {

  def index = Action {
    Redirect(routes.Application.dmpster)
  }

  def dmpster = Action {
    Ok(views.html.index(Dump.all.map(dump => (dump, Tag.tagsForDump(dump))), Tag.all))
  }

  def viewDetails(id: Long) = Action {
    Dump.byId(id)
      .map(dump => views.html.details(dump))
      .map(Ok(_)).getOrElse(BadRequest("dump not found"))
  }

  def uploadAjax = Action(parse.multipartFormData) {
    Logger.info("upload")
    request => request.body.file("file").map { dmp =>
      Logger.info("moving file " + dmp.filename)
      import java.io.File
      val filename = dmp.filename
      val contentType = dmp.contentType
      val dir = new File("public/dmps")
      dir.mkdirs()
      val newFile = new File(dir, filename)
      dmp.ref.moveTo(newFile, true)

      Logger.info("parsing DMP")
      val futureResult = Akka.future { DmpParser(newFile).parse }
      Async {
        futureResult.map(p => {
          Bucket.create(p._1).map(Bucket.byId(_)).map(bucket => {
            Dump.create(bucket, filename, p._2)
            Ok(toJson(Map("status" -> "OK")))
          }).getOrElse(BadRequest("failed to parse DMP"))
        })
      }
    }.getOrElse {
      Logger.warn("file missing")
      Redirect(routes.Application.index).flashing(
        "error" -> "Missing file")
    }
  }

  def addTag(id: Long, tagName: String) = Action {
    val tag = Tag.findByName(tagName).getOrElse({
      Tag.create(tagName)
      Tag.findByName(tagName).get
    })

    Dump.byId(id).map(dump =>
      if (Tag.tagsForDump(dump).exists(_.name == tagName))
        Ok(views.html.tags(dump, Tag.tagsForDump(dump)))
      else {
        Dump.addTag(dump, tag)
        Ok(views.html.tags(dump, Tag.tagsForDump(dump)))
      }).getOrElse(BadRequest("Invalid dump id"))
  }

  def removeTag(id: Long, tagName: String) = Action {
    Tag.findByName(tagName).flatMap(tag => {
      Dump.byId(id).map(dump => {
        Dump.removeTag(dump, tag)
        Ok(views.html.tags(dump, Tag.tagsForDump(dump)))
      })
    }).getOrElse(BadRequest("Invalid dump id or tag"))
  }

  def deleteBucket(id: Long) = TODO

}