from flask import Flask, render_template, flash, request, abort
import requests
import zlib
from settings_private import Settings

app = Flask(__name__)
app.jinja_env.auto_reload = True
settings = Settings()

def get_error(general):
   if general:
      return 'Page cannot be found. Please make sure, the URL is valid for this project and you are connected to the internal network of Janelia.'
   else:
      return 'There was an error while requesting the data. Please make sure this is a valid UUID which has body status data and you are connected to the internal network of Janelia.'

# root route, no information given, just take default values from settings file
@app.route('/')
def get_data():
   try:
      # Set all values to the default values
      tId = settings.default_uuid
      tPort = settings.default_port
      tServer = settings.default_server
      tSkeleton = settings.default_skeleton

      # Replace values in template urls
      url = settings.url.replace('[id]', tId)
      gallery_url = settings.gallery_urlbase.replace('[port]', tPort).replace('[server]', tServer)
      shark_url = settings.shark_url.replace('[id]', tId).replace('[port]', tPort).replace('[server]', tServer).replace('[skeletons]', tSkeleton)

      response = requests.get(url)
      data = zlib.decompress(response.content, zlib.MAX_WBITS|32)
      json_str = data.decode('utf-8')
      sortparams = { 'sortby': 'body ID', 'sortdir': 'asc' }
      return render_template('table.html',
                                 mytable=json_str,
                                 sortparams=sortparams,
                                 uuid=tId,
                                 shark_url = shark_url,
                                 gallery_urlbase = gallery_url,
                                 server = tServer,
                                 port = tPort
                             )
   except Exception as e:
      error = get_error(False)
      print(e)
      return render_template('table.html', error=error)


# route with just basic environment information (server, port, uuid)
@app.route('/<server>/<port>/<uuid>', methods=['GET'])
def get_environment_data(server, port, uuid):
   try:
      instance = settings.default_instance
      key = settings.default_key
      url = settings.full_url
      url = url.replace('[server]', server).replace('[port]', port).replace('[id]', uuid).replace('[instance]', instance).replace('[key]', key)
      gallery_url = settings.gallery_urlbase.replace('[port]', port).replace('[server]', server)
      shark_url = settings.shark_url.replace('[id]', uuid).replace('[port]', port).replace('[server]', server).replace('[skeletons]', skeletons)

      response = requests.get(url)
      data = zlib.decompress(response.content, zlib.MAX_WBITS|32)
      json_str = data.decode('utf-8')
      sortparams = { 'sortby': 'body ID', 'sortdir': 'asc' }

      return render_template('table.html',
                              mytable=json_str,
                              sortparams=sortparams,
                              uuid=uuid,
                              shark_url = shark_url,
                              gallery_urlbase = gallery_url,
                              server = server,
                              port = port
                           )
   except Exception as e:
      print(e)
      abort(404)

# route with all information needed to show the data (server, port, uuid, data instance and key to lookup the statistical body data, the skeleton dataset for the Shark view)
@app.route('/server/<server>/port/<port>/uuid/<uuid>/instance/<instance>/key/<key>/skeletons/<skeletons>', methods=['GET'])
def get_full_data(server, port, uuid, instance, key, skeletons):
   try:

      uuid = str(uuid)
      url = settings.full_url
      url = url.replace('[server]', server).replace('[port]', port).replace('[id]', uuid).replace('[instance]', instance).replace('[key]', key)
      gallery_url = settings.gallery_urlbase.replace('[port]', port).replace('[server]', server)
      shark_url = settings.shark_url.replace('[id]', uuid).replace('[port]', port).replace('[server]', server).replace('[skeletons]', skeletons)

      response = requests.get(url)
      data = zlib.decompress(response.content, zlib.MAX_WBITS|32)
      json_str = data.decode('utf-8')
      sortparams = { 'sortby': 'body ID', 'sortdir': 'asc' }

      return render_template('table.html',
                              mytable=json_str,
                              sortparams=sortparams,
                              uuid=uuid,
                              shark_url = shark_url,
                              gallery_urlbase = gallery_url,
                              server = server,
                              port = port
                           )
   except Exception as e:
      print(e)
      abort(404)

@app.errorhandler(404)
def page_not_found(error):
   return render_template('notfound.html', err=get_error(True)), 404