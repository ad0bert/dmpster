package models

import play.api.db._
import play.api.Play.current
import anorm._
import anorm.SqlParser._

case class Tag(id: Long, name: String) {

}

object Tag {
  def all: List[Tag] = DB.withConnection {
    implicit c =>
      SQL("select * from tag").as(tag *)
  }
  
  def tagsForBucket(bucket: Bucket) = DB.withConnection { implicit c => {
    SQL("select * from bucketToTag btt inner join tag t on t.id = btt.tagId where btt.bucketId = {bucketId}").on('bucketId -> bucket.id).as(tag *)
  }}

  def create(name: String) = {
    DB.withConnection {
      implicit c =>
        SQL("insert into tag (name) values ({name})")
          .on('name -> name).executeUpdate
    }
  }

  def findByName(name: String) = {
    DB.withConnection {
      implicit c =>
        SQL("select * from tag where name = {name}")
          .on('name -> name).as(tag.singleOpt)
    }
  }

  def tag = {
    get[Long]("id") ~
      get[String]("name") map {
        case id ~ name => Tag(id, name)
      }
  }
}