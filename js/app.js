class Search extends React.Component
{
    constructor()
    {
        super();
        this.state = {
            searchString: '',
            contacts: [],
            temp: 1
        };
    }

    componentWillMount() {
        this._fetchContacts();
    }

    _handleChange(e) {
        this.setState({ searchString: e.target.value });
    }

    _addContact(Name, Phone, Email) {
        const newContact = {
            Name,
            Phone,
            Email
        };

        $.ajax({
            method: 'POST',
            url: 'http://example-env.ap-southeast-2.elasticbeanstalk.com/Api/Contacts',
            data: newContact,
            context: {newContact, this}
        }).success(function(message) {
            this.this._fetchContacts();
            $('#alerts').append("<div class='alert alert-success fade in'>Contact has been added</div>").delay(5000).fadeOut();
        }).error(function(){
            $('#alert').append("<div class='alert alert-danger fade in'>There was an error adding your contact</div>").delay(5000).fadeOut();
        });

        $('#add-contact').modal('toggle');
        $('#add-contact-form').trigger("reset");
    }

    _editContact(ID, Name, Phone, Email) {
        const newContact = {
                ID,
                Name,
                Phone,
                Email
        };

        let editURL = 'http://example-env.ap-southeast-2.elasticbeanstalk.com/Api/Contacts/' + ID;

        $.ajax({
            method: 'PUT',
            url: editURL,
            data: newContact,
            context: { newContact, this }
        }).success(function() {
            this.this._fetchContacts();
            $('#alerts').append("<div class='alert alert-success fade in'>Contact has been updated</div>").delay(5000).fadeOut();
        }).error(function() {
            $('#alert').append("<div class='alert alert-danger fade in'>There was an error updating your contact</div>").delay(5000).fadeOut();
        });

        $('#edit-contact').modal('toggle');
    }

    _removeContact(ID, Name) {
        // Confirm if the user wants to delete the contact

        if(confirm("Are you sure you want to delete " + Name + " from your address book?"))
        {
            let deleteURL = 'http://example-env.ap-southeast-2.elasticbeanstalk.com/Api/Contacts/' + ID;
            $.ajax({
                method: 'DELETE',
                url: deleteURL,
                context: { this }
            }).success(function() {
                $('#alerts').append("<div class='alert alert-success fade in'>Contact has been removed</div>").delay(5000).fadeOut();
                this.this._fetchContacts();
            }).error(function(){
                $('#alert').append("<div class='alert alert-danger fade in'>There was an error removing contact from your address book</div>").delay(5000).fadeOut();
            });
        }
    }

    _fetchContacts() {
        $.ajax({
            method: 'GET',
            url: 'http://example-env.ap-southeast-2.elasticbeanstalk.com/Api/Contacts',
            context: { this },
            success: (contacts) => {
                this.setState({ contacts });
            }
        }).success(function(contacts){
            contacts.sort(function(a, b){
                var nameA = a.Name.toLowerCase(), nameB = b.Name.toLowerCase();
                if (nameA < nameB) //sort string ascending
                    return -1;

                if (nameA > nameB)
                    return 1;

                return 0; //default return value (no sorting)
            });
            this.this.setState({ contacts });
        });
    }

    render(){
        var contacts = this.state.contacts;
        var searchString = this.state.searchString.trim().toLowerCase();

        if (searchString.length > 0)
        {
            contacts = contacts.filter(function(item){
                return item.Name.toLowerCase().match(searchString);
            });
        }

        return (
                <section>
                    <div className="row">
                        <div className="col-md-10">
                            <input id="search-bar" ref="search-bar" className="form-control" type="text" value={this.state.searchString} onChange={this._handleChange.bind(this)} placeholder="Search" />
                        </div>
                        <div className="col-md-2 text-right">
                            <button id="add-button" type="button" className="btn btn-default" data-toggle="modal" data-target="#add-contact" data-keyboard="true">Add</button>
                        </div>
                    </div>
                    <table className="table table-striped spacer">
                        <tbody>
                        {
                            contacts.map(function(item){
                                return(
                                    <Contact name={item.Name} email={item.Email} phone={item.Phone} idNumber={item.ID} key={item.ID} removeContact={this._removeContact.bind(this)}  />
                                )
                            }.bind(this))
                        }
                        </tbody>
                    </table>
                    <ViewPhoneModal />
                    <AddContactModal addContact={this._addContact.bind(this)} />
                    <EditContactModal editContact={this._editContact.bind(this)} />
                </section>
        );
    }
}

class Contact extends React.Component {
    render() {
        let emailBody;
        let phoneIDHash = "#view-phone" + this.props.idNumber;

        if (this.props.email)
        {
            emailBody = "mailto:" + this.props.email;
        }

        return (
                <tr>
                    <td className="v-middle">
                        <a href="#" className="text-red" onClick={this._onClickRemove.bind(this)}><span className="glyphicon glyphicon-remove" /  ></a>
                        <a href='#' onClick={this._onClickEdit.bind(this)}>{this.props.name}</a>
                    </td>
                    <td className="v-middle text-right">
                        {this.props.email && <a href={emailBody}>Email</a>}
                        {this.props.phone && <a href="#" onClick={this._onClickPhone.bind(this)}>Phone</a>}
                    </td>
                </tr>
        );
    }

    _onClickPhone(){
        // Set the header
        $('#view-phone #view-phone-header').text(this.props.name + "\'s Phone Number");

        // Set the content
        $('#view-phone #view-phone-content').text(this.props.phone);

        // Show the phone modal
        $('#view-phone').modal('toggle');
    }

    _onClickEdit(){
        // Set the header
        $('#edit-contact #edit-contact-header').text("Edit " + this.props.name + "\'s Contact Details");

        // Set the values in the edit modal's input fields
        $('#edit-contact #edit-id').val(this.props.idNumber);
        $('#edit-contact #edit-name').val(this.props.name);
        $('#edit-contact #edit-phone').val(this.props.phone);
        $('#edit-contact #edit-email').val(this.props.email);

        // Show the edit modal
        $('#edit-contact').modal('toggle');
    }

    _onClickRemove()
    {
        this.props.removeContact(this.props.idNumber, this.props.name);
    }
}

class AddContactModal extends React.Component{
    render() {
        return(
            <div className="modal fade" id="add-contact" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal">&times;</button>
                            <h4 className="modal-title">Add a New Contact</h4>
                        </div>
                        <div className="modal-body">
                            <form id="add-contact-form" role="form" onSubmit={this._handleSubmit.bind(this)}>
                                <div className="form-group">
                                    <label for="name">Name:</label>
                                    <input type="text" className="form-control" id="name" placeholder="Enter Name" ref={(input) => this._name = input} />
                                </div>
                                <div className="form-group">
                                    <label for="phone">Phone Number:</label>
                                    <input type="tel" className="form-control" id="phone" placeholder="Enter Phone Number" ref={(input) => this._phone = input} />
                                </div>
                                <div className="form-group">
                                    <label for="email">Email Address:</label>
                                    <input type="email" className="form-control" id="email" placeholder="Enter Email Address" ref={(input) => this._email = input} />
                                </div>
                                <button type="submit" className="btn btn-default">Add</button>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button id='close-button' type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    _handleSubmit(event) {
        event.preventDefault();

        this.props.addContact(this._name.value, this._phone.value, this._email.value);
        // Note: the closing of the modal is handled in the function above to ensure the data is saved before it is disposed.
    }

    componentDidMount() {
        $('#add-contact').on('hidden.bs.modal', function () {
            $('#add-contact-form').trigger("reset");
        });
    }
}

class EditContactModal extends React.Component {
    render() {
        return(
            <div className="modal fade" id='edit-contact' tabindex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal">&times;</button>
                            <h4 id="edit-contact-header" className="modal-title">Edit Details</h4>
                        </div>
                        <div className="modal-body">
                            <div id='edit-contact-content'>
                            <form id="edit-contact-form" role="form" onSubmit={this._handleSubmit.bind(this)}>
                                <input id="edit-id" type="hidden" ref={(input) => this._id = input} />
                                <div className="form-group">
                                    <label for="name">Name:</label>
                                    <input id="edit-name" type="text" className="form-control" placeholder="Enter Name" ref={(input) => this._name = input} />
                                </div>
                                <div className="form-group">
                                    <label for="phone">Phone Number:</label>
                                    <input id="edit-phone" type="tel" className="form-control" placeholder="Enter Phone Number" ref={(input) => this._phone = input} />
                                </div>
                                <div className="form-group">
                                    <label for="email">Email Address:</label>
                                    <input id="edit-email" type="email" className="form-control" placeholder="Enter Email Address" ref={(input) => this._email = input} />
                                </div>
                                <button type="submit" className="btn btn-default">Save</button>
                            </form>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    _handleSubmit(event) {
        event.preventDefault();
        this.props.editContact(this._id.value, this._name.value, this._phone.value, this._email.value);
        // Note: the closing of the modal is handled in the function above to ensure the data is saved before it is disposed.
    }
}

class ViewPhoneModal extends React.Component {
    render() {
        return(
            <div className="modal fade" id='view-phone' tabindex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal">&times;</button>
                            <h4 id="view-phone-header" className="modal-title">Phone Number</h4>
                        </div>
                        <div className="modal-body">
                            <p id='view-phone-content'>Phone Number</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <Search />,
    document.getElementById('content')
);
