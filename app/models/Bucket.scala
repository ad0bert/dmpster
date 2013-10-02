package models

import play.api.db._
import play.api.Play.current
import anorm._
import anorm.SqlParser._
import language.postfixOps

case class Bucket(
  id: Long,
  name: String) extends Taggable {

  val url = "bucket"

  def tags = Tag.forBucket(this)
}

object Bucket {
  def all: List[Bucket] = DB.withConnection { implicit c =>
    SQL("select * from bucket").as(bucket *)
  }

  def create(name: String): Option[Long] = DB.withConnection { implicit c =>
    SQL("insert into bucket (name) select ({name}) where not exists (select * from bucket where name = {name})")
      .on('name -> name)
      .executeInsert()
  }

  def findOrCreate(name: String): Bucket = DB.withConnection { implicit c =>
    findByName(name)
      .getOrElse(create(name).map(byId) // does not exist yet, create it
        .getOrElse(findByName(name).get)) // someone created it at the same time, re-find by name
  }

  def findByName(name: String): Option[Bucket] = DB.withConnection { implicit c =>
    SQL("select * from bucket where name = {name}").on('name -> name)
      .as(bucket singleOpt)
  }

  def byId(id: Long) = DB.withConnection { implicit c =>
    SQL("select * from bucket where id = {id}").on('id -> id).as(bucket single)
  }

  def addTag(bucket: Bucket, tag: Tag) =
    DB.withConnection { implicit c =>
      SQL("insert into bucketToTag (bucketId, tagId) values ({bucketId}, {tagId})")
        .on('bucketId -> bucket.id, 'tagId -> tag.id).executeUpdate
    }

  def removeTag(bucket: Bucket, tag: Tag) =
    DB.withConnection { implicit c =>
      SQL("delete from bucketToTag where bucketId = {bucketId} and tagId = {tagId}")
        .on('bucketId -> bucket.id, 'tagId -> tag.id).executeUpdate
    }

  def bucket = {
    get[Long]("id") ~
      get[String]("name") map {
        case id ~ name => Bucket(id, name)
      }
  }

}