from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import os
from datetime import datetime
import random

# Flask app setup
basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'jail.db')  # Use PostgreSQL in production
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Replace with a secure key
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": "http://your-frontend-domain.com"}})  # Update with your frontend domain

# Database Models
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='Staff')
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100))

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

class Item(db.Model):
    __tablename__ = 'item'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    barcode = db.Column(db.String(20), unique=True, nullable=False)
    vendor = db.Column(db.String(100))
    cost = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='In Stock')
    condition = db.Column(db.String(20), default='New')
    notes = db.Column(db.Text)

class Inmate(db.Model):
    __tablename__ = 'inmate'
    id = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    housing_unit = db.Column(db.String(50), default='Unknown')
    fees_paid = db.Column(db.Float, default=0.0)
    notes = db.Column(db.Text)

class InmateItem(db.Model):
    __tablename__ = 'inmate_item'
    id = db.Column(db.Integer, primary_key=True)
    inmate_id = db.Column(db.String(20), db.ForeignKey('inmate.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    assigned_date = db.Column(db.DateTime, default=datetime.utcnow)
    return_status = db.Column(db.String(20))
    condition = db.Column(db.String(20))
    item = db.relationship('Item', backref='inmate_items')
    inmate = db.relationship('Inmate', backref='inmate_items')

class Fee(db.Model):
    __tablename__ = 'fee'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    inmate_id = db.Column(db.String(20), db.ForeignKey('inmate.id'), nullable=True)
    item_barcodes = db.Column(db.String(200))
    date_applied = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)

class ActionLog(db.Model):
    __tablename__ = 'action_log'
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text)

class RecycledBarcodes(db.Model):
    __tablename__ = 'recycled_barcodes'
    id = db.Column(db.Integer, primary_key=True)
    barcode = db.Column(db.String(20), unique=True, nullable=False)

# Utility function to generate unique barcodes
def generate_barcode(item_code, size_code):
    serial = str(random.randint(1, 999999)).zfill(6)
    barcode = f"{item_code}{size_code}{serial}"
    while Item.query.filter_by(barcode=barcode).first() or RecycledBarcodes.query.filter_by(barcode=barcode).first():
        serial = str(random.randint(1, 999999)).zfill(6)
        barcode = f"{item_code}{size_code}{serial}"
    return barcode

# Routes
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        token = create_access_token(identity={'id': user.id, 'role': user.role})
        return jsonify({'token': token})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/inmates', methods=['GET'])
@jwt_required()
def get_inmates():
    try:
        inmates = Inmate.query.all()
        return jsonify([{
            'id': inmate.id,
            'name': inmate.name,
            'housing_unit': inmate.housing_unit,
            'fees_paid': inmate.fees_paid,
            'notes': inmate.notes
        } for inmate in inmates])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/inmates', methods=['POST'])
@jwt_required()
def add_inmate():
    identity = get_jwt_identity()
    if identity['role'] not in ['Admin', 'Staff']:
        return jsonify({'error': 'Permission denied'}), 403
    data = request.get_json()
    if not data.get('id') or not data.get('name'):
        return jsonify({'error': 'Inmate ID and Name are required'}), 400
    try:
        inmate = Inmate(
            id=data['id'],
            name=data['name'],
            housing_unit=data.get('housing_unit', 'Unknown'),
            fees_paid=data.get('fees_paid', 0.0),
            notes=data.get('notes', '')
        )
        db.session.add(inmate)
        db.session.commit()
        log = ActionLog(action='Inmate Added', user_id=identity['id'], details=f"Inmate {inmate.id} added")
        db.session.add(log)
        db.session.commit()
        return jsonify({'message': 'Inmate added successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Initialize database and seed with default users
with app.app_context():
    db.create_all()
    if not User.query.first():
        admin = User(username='admin', role='Admin', first_name='Admin', last_name='User', email='admin@example.com')
        admin.set_password('admin123')
        staff = User(username='staff', role='Staff', first_name='Staff', last_name='One', email='staff@example.com')
        staff.set_password('staff123')
        trustee = User(username='trustee', role='Trustee', first_name='Trustee', last_name='Two', email='trustee@example.com')
        trustee.set_password('trustee123')
        db.session.add_all([admin, staff, trustee])
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=False, port=5000)  # Disable debug mode in production
