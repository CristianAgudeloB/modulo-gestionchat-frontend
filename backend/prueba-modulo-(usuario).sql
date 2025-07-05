/*==============================================================*/
/* DBMS name:      ORACLE Version 10g                           */
/* Created on:     4/07/2025 7:22:22 p.Ām.                      */
/*==============================================================*/


alter table AMIGO
   drop constraint FK_AMIGO_AMIGO_USUARIO;

alter table AMIGO
   drop constraint FK_AMIGO_AMIGO2_USUARIO;

alter table CONFIGRUPO
   drop constraint FK_CONFIGRU_GRUPO_GRUPO;

alter table CONFIGRUPO
   drop constraint FK_CONFIGRU_PROPIGRUP_PROPIEDA;

alter table CONFIUSER
   drop constraint FK_CONFIUSE_PROPIUSER_PROPIEDA;

alter table CONFIUSER
   drop constraint FK_CONFIUSE_USUARIO_USUARIO;

alter table CONTENIDO
   drop constraint FK_CONTENID_MENSAJE_MENSAJE;

alter table CONTENIDO
   drop constraint FK_CONTENID_TIPOARCHI_TIPOARCH;

alter table CONTENIDO
   drop constraint FK_CONTENID_TIPOCONTE_TIPOCONT;

alter table GRUPO
   drop constraint FK_GRUPO_CREAOADMI_USUARIO;

alter table GRUPO
   drop constraint FK_GRUPO_MODIFICAG_GRUPO;

alter table MENSAJE
   drop constraint FK_MENSAJE_ENVIA_USUARIO;

alter table MENSAJE
   drop constraint FK_MENSAJE_GRUPOMENS_GRUPO;

alter table MENSAJE
   drop constraint FK_MENSAJE_HILO_MENSAJE;

alter table MENSAJE
   drop constraint FK_MENSAJE_RECIBE_USUARIO;

alter table PERTENECE
   drop constraint FK_PERTENEC_PERTENECE_GRUPO;

alter table PERTENECE
   drop constraint FK_PERTENEC_PERTENECE_USUARIO;

alter table PROPIEDAD
   drop constraint FK_PROPIEDA_PROPIEDAD_PROPIEDA;

alter table SEGUIR
   drop constraint FK_SEGUIR_SEGUIR_USUARIO;

alter table SEGUIR
   drop constraint FK_SEGUIR_SEGUIR2_USUARIO;

alter table UBICACION
   drop constraint FK_UBICACIO_TIPOUBICA_TIPOUBIC;

alter table UBICACION
   drop constraint FK_UBICACIO_UBICASUP_UBICACIO;

alter table USUARIO
   drop constraint FK_USUARIO_ACTUALIZA_USUARIO;

alter table USUARIO
   drop constraint FK_USUARIO_UBICA_UBICACIO;

drop index AMIG_2_FK;

drop index AMIG__FK;

drop table AMIGO cascade constraints;

drop index GRUPO_FK;

drop index PROPIGRUPO_FK;

drop table CONFIGRUPO cascade constraints;

drop index USUARIO_FK;

drop index PROPIUSER_FK;

drop table CONFIUSER cascade constraints;

drop index MENSAJE_FK;

drop index TIPOARCHIVO_FK;

drop index TIPOCONTE_FK;

drop table CONTENIDO cascade constraints;

drop index CREAOADMINISTRA_FK;

drop index MODIFICAGRUPO_FK;

drop table GRUPO cascade constraints;

drop index RECIBE_FK;

drop index ENVIA_FK;

drop index GRUPOMENSAJE_FK;

drop index HILO_FK;

drop table MENSAJE cascade constraints;

drop index PERTENECE_FK;

drop index PERTENECE2_FK;

drop table PERTENECE cascade constraints;

drop index PROPIEDADSUP_FK;

drop table PROPIEDAD cascade constraints;

drop index SEGUIR_FK;

drop index SEGUIR2_FK;

drop table SEGUIR cascade constraints;

drop table TIPOARCHIVO cascade constraints;

drop table TIPOCONTENIDO cascade constraints;

drop table TIPOUBICA cascade constraints;

drop index TIPOUBICA_FK;

drop index UBICASUP_FK;

drop table UBICACION cascade constraints;

drop index ACTUALIZAPERFIL_FK;

drop index UBICA_FK;

drop table USUARIO cascade constraints;

/*==============================================================*/
/* Table: AMIGO                                                 */
/*==============================================================*/
create table AMIGO  (
   USE_CONSECUSER       VARCHAR2(5)                     not null,
   CONSECUSER           VARCHAR2(5)                     not null,
   constraint PK_AMIGO primary key (USE_CONSECUSER, CONSECUSER)
);

/*==============================================================*/
/* Index: AMIG__FK                                              */
/*==============================================================*/
create index AMIG__FK on AMIGO (
   USE_CONSECUSER ASC
);

/*==============================================================*/
/* Index: AMIG_2_FK                                             */
/*==============================================================*/
create index AMIG_2_FK on AMIGO (
   CONSECUSER ASC
);

/*==============================================================*/
/* Table: CONFIGRUPO                                            */
/*==============================================================*/
create table CONFIGRUPO  (
   CODGRUPO             NUMBER(5,0)                     not null,
   NCONFIGGRUPO         NUMBER(3,0)                     not null,
   IDPROPIEDAD          VARCHAR2(2)                     not null,
   ESTADO               SMALLINT,
   constraint PK_CONFIGRUPO primary key (CODGRUPO, NCONFIGGRUPO)
);

/*==============================================================*/
/* Index: PROPIGRUPO_FK                                         */
/*==============================================================*/
create index PROPIGRUPO_FK on CONFIGRUPO (
   IDPROPIEDAD ASC
);

/*==============================================================*/
/* Index: GRUPO_FK                                              */
/*==============================================================*/
create index GRUPO_FK on CONFIGRUPO (
   CODGRUPO ASC
);

/*==============================================================*/
/* Table: CONFIUSER                                             */
/*==============================================================*/
create table CONFIUSER  (
   CONSECUSER           VARCHAR2(5)                     not null,
   NCONFIGUSER          NUMBER(3)                       not null,
   IDPROPIEDAD          VARCHAR2(2)                     not null,
   ESTADO               SMALLINT,
   VALOR                NUMBER(1),
   constraint PK_CONFIUSER primary key (CONSECUSER, NCONFIGUSER)
);

/*==============================================================*/
/* Index: PROPIUSER_FK                                          */
/*==============================================================*/
create index PROPIUSER_FK on CONFIUSER (
   IDPROPIEDAD ASC
);

/*==============================================================*/
/* Index: USUARIO_FK                                            */
/*==============================================================*/
create index USUARIO_FK on CONFIUSER (
   CONSECUSER ASC
);

/*==============================================================*/
/* Table: CONTENIDO                                             */
/*==============================================================*/
create table CONTENIDO  (
   USE_CONSECUSER       VARCHAR2(5)                     not null,
   CONSECUSER           VARCHAR2(5)                     not null,
   CONSMENSAJE          NUMBER(5,0)                     not null,
   CONSECCONTENIDO      NUMBER(2,0)                     not null,
   IDTIPOCONTENIDO      VARCHAR2(2)                     not null,
   IDTIPOARCHIVO        VARCHAR2(2),
   CONTENIDOIMAG        BLOB                            not null,
   LOCALIZACONTENIDO    VARCHAR2(255),
   constraint PK_CONTENIDO primary key (USE_CONSECUSER, CONSECUSER, CONSMENSAJE, CONSECCONTENIDO)
);

/*==============================================================*/
/* Index: TIPOCONTE_FK                                          */
/*==============================================================*/
create index TIPOCONTE_FK on CONTENIDO (
   IDTIPOCONTENIDO ASC
);

/*==============================================================*/
/* Index: TIPOARCHIVO_FK                                        */
/*==============================================================*/
create index TIPOARCHIVO_FK on CONTENIDO (
   IDTIPOARCHIVO ASC
);

/*==============================================================*/
/* Index: MENSAJE_FK                                            */
/*==============================================================*/
create index MENSAJE_FK on CONTENIDO (
   USE_CONSECUSER ASC,
   CONSECUSER ASC,
   CONSMENSAJE ASC
);

/*==============================================================*/
/* Table: GRUPO                                                 */
/*==============================================================*/
create table GRUPO  (
   CODGRUPO             NUMBER(5,0)                     not null,
   GRU_CODGRUPO         NUMBER(5,0),
   CONSECUSER           VARCHAR2(5)                     not null,
   NOMGRUPO             VARCHAR2(30)                    not null,
   FECHAREGGRUPO        DATE                            not null,
   IMAGGRUPO            BLOB                            not null,
   constraint PK_GRUPO primary key (CODGRUPO)
);

/*==============================================================*/
/* Index: MODIFICAGRUPO_FK                                      */
/*==============================================================*/
create index MODIFICAGRUPO_FK on GRUPO (
   GRU_CODGRUPO ASC
);

/*==============================================================*/
/* Index: CREAOADMINISTRA_FK                                    */
/*==============================================================*/
create index CREAOADMINISTRA_FK on GRUPO (
   CONSECUSER ASC
);

/*==============================================================*/
/* Table: MENSAJE                                               */
/*==============================================================*/
create table MENSAJE  (
   USE_CONSECUSER       VARCHAR2(5)                     not null,
   CONSECUSER           VARCHAR2(5)                     not null,
   CONSMENSAJE          NUMBER(5,0)                     not null,
   MEN_USE_CONSECUSER   VARCHAR2(5),
   MEN_CONSECUSER       VARCHAR2(5),
   MEN_CONSMENSAJE      NUMBER(5,0),
   CODGRUPO             NUMBER(5,0),
   FECHAREGMEN          DATE                            not null,
   constraint PK_MENSAJE primary key (USE_CONSECUSER, CONSECUSER, CONSMENSAJE)
);

/*==============================================================*/
/* Index: HILO_FK                                               */
/*==============================================================*/
create index HILO_FK on MENSAJE (
   MEN_USE_CONSECUSER ASC,
   MEN_CONSECUSER ASC,
   MEN_CONSMENSAJE ASC
);

/*==============================================================*/
/* Index: GRUPOMENSAJE_FK                                       */
/*==============================================================*/
create index GRUPOMENSAJE_FK on MENSAJE (
   CODGRUPO ASC
);

/*==============================================================*/
/* Index: ENVIA_FK                                              */
/*==============================================================*/
create index ENVIA_FK on MENSAJE (
   CONSECUSER ASC
);

/*==============================================================*/
/* Index: RECIBE_FK                                             */
/*==============================================================*/
create index RECIBE_FK on MENSAJE (
   USE_CONSECUSER ASC
);

/*==============================================================*/
/* Table: PERTENECE                                             */
/*==============================================================*/
create table PERTENECE  (
   CODGRUPO             NUMBER(5,0)                     not null,
   CONSECUSER           VARCHAR2(5)                     not null,
   constraint PK_PERTENECE primary key (CODGRUPO, CONSECUSER)
);

/*==============================================================*/
/* Index: PERTENECE2_FK                                         */
/*==============================================================*/
create index PERTENECE2_FK on PERTENECE (
   CONSECUSER ASC
);

/*==============================================================*/
/* Index: PERTENECE_FK                                          */
/*==============================================================*/
create index PERTENECE_FK on PERTENECE (
   CODGRUPO ASC
);

/*==============================================================*/
/* Table: PROPIEDAD                                             */
/*==============================================================*/
create table PROPIEDAD  (
   IDPROPIEDAD          VARCHAR2(2)                     not null,
   PRO_IDPROPIEDAD      VARCHAR2(2),
   DESCPROPIEDAD        VARCHAR2(100),
   VALORDEFECTO         SMALLINT,
   VALORPROPIEDAD       VARCHAR2(30),
   constraint PK_PROPIEDAD primary key (IDPROPIEDAD)
);

/*==============================================================*/
/* Index: PROPIEDADSUP_FK                                       */
/*==============================================================*/
create index PROPIEDADSUP_FK on PROPIEDAD (
   PRO_IDPROPIEDAD ASC
);

/*==============================================================*/
/* Table: SEGUIR                                                */
/*==============================================================*/
create table SEGUIR  (
   USE_CONSECUSER       VARCHAR2(5)                     not null,
   CONSECUSER           VARCHAR2(5)                     not null,
   constraint PK_SEGUIR primary key (USE_CONSECUSER, CONSECUSER)
);

/*==============================================================*/
/* Index: SEGUIR2_FK                                            */
/*==============================================================*/
create index SEGUIR2_FK on SEGUIR (
   CONSECUSER ASC
);

/*==============================================================*/
/* Index: SEGUIR_FK                                             */
/*==============================================================*/
create index SEGUIR_FK on SEGUIR (
   USE_CONSECUSER ASC
);

/*==============================================================*/
/* Table: TIPOARCHIVO                                           */
/*==============================================================*/
create table TIPOARCHIVO  (
   IDTIPOARCHIVO        VARCHAR2(2)                     not null,
   DESCTIPOARCHIVO      VARCHAR2(30)                    not null,
   constraint PK_TIPOARCHIVO primary key (IDTIPOARCHIVO)
);

/*==============================================================*/
/* Table: TIPOCONTENIDO                                         */
/*==============================================================*/
create table TIPOCONTENIDO  (
   IDTIPOCONTENIDO      VARCHAR2(2)                     not null,
   DESCTIPOCONTENIDO    VARCHAR2(30)                    not null,
   constraint PK_TIPOCONTENIDO primary key (IDTIPOCONTENIDO)
);

/*==============================================================*/
/* Table: TIPOUBICA                                             */
/*==============================================================*/
create table TIPOUBICA  (
   CODTIPOUBICA         VARCHAR2(3)                     not null,
   DESCTIPOUBICA        VARCHAR2(20)                    not null,
   constraint PK_TIPOUBICA primary key (CODTIPOUBICA)
);

/*==============================================================*/
/* Table: UBICACION                                             */
/*==============================================================*/
create table UBICACION  (
   CODUBICA             VARCHAR2(4)                     not null,
   UBI_CODUBICA         VARCHAR2(4),
   CODTIPOUBICA         VARCHAR2(3)                     not null,
   NOMUBICA             VARCHAR2(30)                    not null,
   constraint PK_UBICACION primary key (CODUBICA)
);

/*==============================================================*/
/* Index: UBICASUP_FK                                           */
/*==============================================================*/
create index UBICASUP_FK on UBICACION (
   UBI_CODUBICA ASC
);

/*==============================================================*/
/* Index: TIPOUBICA_FK                                          */
/*==============================================================*/
create index TIPOUBICA_FK on UBICACION (
   CODTIPOUBICA ASC
);

/*==============================================================*/
/* Table: USUARIO                                               */
/*==============================================================*/
create table USUARIO  (
   CONSECUSER           VARCHAR2(5)                     not null,
   CODUBICA             VARCHAR2(4)                     not null,
   USE_CONSECUSER       VARCHAR2(5),
   NOMBRE               VARCHAR2(25)                    not null,
   APELLIDO             VARCHAR2(25)                    not null,
   NOMBRE_USUARIO       VARCHAR2(6)                     not null,
   FECHAREGISTRO        DATE                            not null,
   EMAIL                VARCHAR2(50)                    not null,
   CELULAR              VARCHAR2(16)                    not null,
   IMAGEUSER            BLOB,
   TEMAUSER             BLOB,
   HUELLAUSER           BLOB,
   constraint PK_USUARIO primary key (CONSECUSER)
);

/*==============================================================*/
/* Index: UBICA_FK                                              */
/*==============================================================*/
create index UBICA_FK on USUARIO (
   CODUBICA ASC
);

/*==============================================================*/
/* Index: ACTUALIZAPERFIL_FK                                    */
/*==============================================================*/
create index ACTUALIZAPERFIL_FK on USUARIO (
   USE_CONSECUSER ASC
);

alter table AMIGO
   add constraint FK_AMIGO_AMIGO_USUARIO foreign key (USE_CONSECUSER)
      references USUARIO (CONSECUSER);

alter table AMIGO
   add constraint FK_AMIGO_AMIGO2_USUARIO foreign key (CONSECUSER)
      references USUARIO (CONSECUSER);

alter table CONFIGRUPO
   add constraint FK_CONFIGRU_GRUPO_GRUPO foreign key (CODGRUPO)
      references GRUPO (CODGRUPO);

alter table CONFIGRUPO
   add constraint FK_CONFIGRU_PROPIGRUP_PROPIEDA foreign key (IDPROPIEDAD)
      references PROPIEDAD (IDPROPIEDAD);

alter table CONFIUSER
   add constraint FK_CONFIUSE_PROPIUSER_PROPIEDA foreign key (IDPROPIEDAD)
      references PROPIEDAD (IDPROPIEDAD);

alter table CONFIUSER
   add constraint FK_CONFIUSE_USUARIO_USUARIO foreign key (CONSECUSER)
      references USUARIO (CONSECUSER);

alter table CONTENIDO
   add constraint FK_CONTENID_MENSAJE_MENSAJE foreign key (USE_CONSECUSER, CONSECUSER, CONSMENSAJE)
      references MENSAJE (USE_CONSECUSER, CONSECUSER, CONSMENSAJE);

alter table CONTENIDO
   add constraint FK_CONTENID_TIPOARCHI_TIPOARCH foreign key (IDTIPOARCHIVO)
      references TIPOARCHIVO (IDTIPOARCHIVO);

alter table CONTENIDO
   add constraint FK_CONTENID_TIPOCONTE_TIPOCONT foreign key (IDTIPOCONTENIDO)
      references TIPOCONTENIDO (IDTIPOCONTENIDO);

alter table GRUPO
   add constraint FK_GRUPO_CREAOADMI_USUARIO foreign key (CONSECUSER)
      references USUARIO (CONSECUSER);

alter table GRUPO
   add constraint FK_GRUPO_MODIFICAG_GRUPO foreign key (GRU_CODGRUPO)
      references GRUPO (CODGRUPO);

alter table MENSAJE
   add constraint FK_MENSAJE_ENVIA_USUARIO foreign key (CONSECUSER)
      references USUARIO (CONSECUSER);

alter table MENSAJE
   add constraint FK_MENSAJE_GRUPOMENS_GRUPO foreign key (CODGRUPO)
      references GRUPO (CODGRUPO);

alter table MENSAJE
   add constraint FK_MENSAJE_HILO_MENSAJE foreign key (MEN_USE_CONSECUSER, MEN_CONSECUSER, MEN_CONSMENSAJE)
      references MENSAJE (USE_CONSECUSER, CONSECUSER, CONSMENSAJE);

alter table MENSAJE
   add constraint FK_MENSAJE_RECIBE_USUARIO foreign key (USE_CONSECUSER)
      references USUARIO (CONSECUSER);

alter table PERTENECE
   add constraint FK_PERTENEC_PERTENECE_GRUPO foreign key (CODGRUPO)
      references GRUPO (CODGRUPO);

alter table PERTENECE
   add constraint FK_PERTENEC_PERTENECE_USUARIO foreign key (CONSECUSER)
      references USUARIO (CONSECUSER);

alter table PROPIEDAD
   add constraint FK_PROPIEDA_PROPIEDAD_PROPIEDA foreign key (PRO_IDPROPIEDAD)
      references PROPIEDAD (IDPROPIEDAD);

alter table SEGUIR
   add constraint FK_SEGUIR_SEGUIR_USUARIO foreign key (USE_CONSECUSER)
      references USUARIO (CONSECUSER);

alter table SEGUIR
   add constraint FK_SEGUIR_SEGUIR2_USUARIO foreign key (CONSECUSER)
      references USUARIO (CONSECUSER);

alter table UBICACION
   add constraint FK_UBICACIO_TIPOUBICA_TIPOUBIC foreign key (CODTIPOUBICA)
      references TIPOUBICA (CODTIPOUBICA);

alter table UBICACION
   add constraint FK_UBICACIO_UBICASUP_UBICACIO foreign key (UBI_CODUBICA)
      references UBICACION (CODUBICA);

alter table USUARIO
   add constraint FK_USUARIO_ACTUALIZA_USUARIO foreign key (USE_CONSECUSER)
      references USUARIO (CONSECUSER);

alter table USUARIO
   add constraint FK_USUARIO_UBICA_UBICACIO foreign key (CODUBICA)
      references UBICACION (CODUBICA);