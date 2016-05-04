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
            url: 'Api/Contacts',
            data: newContact,
            context: {newContact, this}
        }).success(function(message) {
            this.newContact.ID = message.id;
            this.this.setState({contacts: this.this.state.contacts.concat([newContact]) });
        }).error(function(){
            alert("There was an error adding your contact.")
        });

        $('#add-contact').modal('toggle');
        $('#add-contact-form').trigger("reset");
    }

    _fetchContacts() {
        $.ajax({
            method: 'GET',
            url: 'Api/Contacts',
            success: (contacts) => {
                this.setState({ contacts });
            }
        });
    }

    render(){
        var libraries = this.state.contacts;
        var searchString = this.state.searchString.trim().toLowerCase();

        if (searchString.length > 0)
        {
            libraries = libraries.filter(function(item){
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
                            libraries.map(function(item){
                                return(
                                    <Contact name={item.Name} email={item.Email} phone={item.Phone} idNumber={item.ID} key={item.ID} />
                                )
                            })
                        }
                        </tbody>
                    </table>
                    <PhoneModal />
                    <AddContactModal addContact={this._addContact.bind(this)} />
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
                    <td className="v-middle"><a href='#' data-toggle="modal" data-target="#edit-contact">{this.props.name}</a></td>
                    <td className="v-middle text-right">
                        {this.props.email && <a href={emailBody}>Email</a>}
                        {this.props.phone && <a href="#" onClick={this._onClickPhone.bind(this)}>Phone</a>}
                    </td>
                </tr>
        );
    }

    _onClickPhone()
    {
        // Set the header
        $('#view-phone #view-phone-header').text(this.props.name + "\'s Phone Number");

        // Set the content
        $('#view-phone #view-phone-content').text(this.props.phone);

        // Show the phone modal
        $('#view-phone').modal('toggle')
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
                                    <input id="try-this" type="text" className="form-control" id="name" placeholder="Enter Name" ref={(input) => this._name = input} />
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

        let name = this._name.value;
        let phone = this._phone.value;
        let email = this._email.value;

        this.props.addContact(name, phone, email);
    }

    componentDidMount() {
        $('#add-contact').on('hidden.bs.modal', function () {
            $('#add-contact-form').trigger("reset");
        });
    }
}

class PhoneModal extends React.Component {
    render() {
        let elementID = "view-phone";
        return(
            <div className="modal fade" id={elementID} tabindex="-1">
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
